'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay, addDays, isWithinInterval, differenceInHours, startOfWeek, endOfWeek } from 'date-fns'
import { buildCensusSnapshot } from '@/lib/census-engine'

export interface ScheduleResult {
    success: boolean
    assignments: {
        shiftId: string
        staffId: string | null
        score?: number
        reason?: string
    }[]
    unfilled: {
        shiftId: string
        reason: string
    }[]
}

export async function autoScheduleWeek(weekStart: Date): Promise<ScheduleResult> {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const start = startOfWeek(weekStart, { weekStartsOn: 1 })
    const end = endOfWeek(weekStart, { weekStartsOn: 1 })

    // 1. Get all DRAFT unassigned shifts for the week (with their pattern)
    const shifts = await prisma.shift.findMany({
        where: {
            workspaceId: user.workspaceId,
            date: { gte: start, lte: end },
            status: 'DRAFT',
            staffId: null
        },
        include: { pattern: true }
    })

    // 2. For CENSUS-driven patterns, calculate required staff from live census
    //    and expand shifts accordingly (we don't create new DB rows here — we
    //    just note how many staff are needed per shift pattern slot)
    const activeAssignments = await prisma.bedAssignment.findMany({
        where: {
            bed: { workspaceId: user.workspaceId },
            endTime: null,
        },
        select: { patientAcuity: true },
    })
    const censusSnapshot = buildCensusSnapshot(activeAssignments)

    // 3. Get all staff in the workspace
    const staff = await prisma.staff.findMany({
        where: { workspaceId: user.workspaceId },
        include: {
            shifts: {
                where: {
                    date: { gte: addDays(start, -1), lte: addDays(end, 1) }
                }
            },
            availability: {
                where: {
                    OR: [
                        { startDate: { lte: end }, endDate: { gte: start } }
                    ]
                }
            }
        }
    })

    // 4. Get burden history (last 4 weeks)
    const fourWeeksAgo = addDays(start, -28)
    const burdens = await prisma.staffBurden.findMany({
        where: {
            staffId: { in: staff.map(s => s.id) },
            date: { gte: fourWeeksAgo }
        }
    })

    // 5. Sort shifts: hardest/heaviest first
    const sortedShifts = [...shifts].sort((a, b) => b.unfairnessWeight - a.unfairnessWeight)

    const assignments: any[] = []
    const unfilled: any[] = []

    for (const shift of sortedShifts) {
        // For CENSUS demand type, check if we actually need more staff than already assigned
        if (shift.pattern.demandType === 'CENSUS') {
            const alreadyAssigned = shifts.filter(
                s => s.patternId === shift.patternId && s.staffId !== null
            ).length
            if (alreadyAssigned >= censusSnapshot.requiredNurses) {
                // Census says we have enough — skip this slot
                unfilled.push({
                    shiftId: shift.id,
                    reason: `Census-driven: ${censusSnapshot.requiredNurses} nurses already sufficient for ${censusSnapshot.totalOccupied} patients`
                })
                continue
            }
        }

        const candidates = staff.filter(s =>
            s.role === shift.requiredRole &&
            canWorkShift(s, shift)
        )

        if (candidates.length === 0) {
            unfilled.push({
                shiftId: shift.id,
                reason: `No available ${shift.requiredRole} found for this time`
            })
            continue
        }

        const scored = candidates.map(s => ({
            staff: s,
            score: calculateZaydScore(s, shift, burdens)
        }))

        scored.sort((a, b) => b.score - a.score)
        const best = scored[0]

        await prisma.shift.update({
            where: { id: shift.id },
            data: { staffId: best.staff.id }
        })

        await prisma.staffBurden.create({
            data: {
                staffId: best.staff.id,
                shiftId: shift.id,
                burdenValue: shift.unfairnessWeight,
                date: shift.date
            }
        })

        // Update local staff state to prevent double-booking in this loop
        const staffIndex = staff.findIndex(s => s.id === best.staff.id)
        if (staffIndex !== -1) {
            staff[staffIndex].shifts.push(shift as any)
        }

        assignments.push({
            shiftId: shift.id,
            staffId: best.staff.id,
            score: best.score
        })
    }

    revalidatePath('/rota')
    return { success: true, assignments, unfilled }
}

function calculateZaydScore(staff: any, shift: any, burdens: any[]): number {
    const staffBurden = burdens
        .filter(b => b.staffId === staff.id)
        .reduce((sum, b) => sum + b.burdenValue, 0)

    const fairnessScore = 1 / (staffBurden + 1)

    const ratingDiff = Math.abs((staff.rating || 1) - shift.targetRating)
    const ratingScore = Math.max(0, (5 - ratingDiff) / 5)

    const weekShifts = staff.shifts.filter((s: any) =>
        isWithinInterval(new Date(s.date), {
            start: startOfWeek(new Date(shift.date), { weekStartsOn: 1 }),
            end: endOfWeek(new Date(shift.date), { weekStartsOn: 1 })
        })
    )

    const hoursAlreadyWorked = weekShifts.reduce((sum: number, s: any) => {
        const duration = differenceInHours(new Date(s.endTime), new Date(s.startTime))
        return sum + duration
    }, 0)

    const remainingCapacity = Math.max(0, staff.contractHours - hoursAlreadyWorked)
    const availabilityScore = staff.contractHours > 0 ? remainingCapacity / staff.contractHours : 0

    return (ratingScore * 0.4) + (fairnessScore * 0.3) + (availabilityScore * 0.3)
}

function canWorkShift(staff: any, shift: any): boolean {
    const shiftStart = new Date(shift.startTime)
    const shiftEnd = new Date(shift.endTime)

    const isOnLeave = staff.availability.some((a: any) => {
        const start = new Date(a.startDate)
        const end = endOfDay(new Date(a.endDate))
        return isWithinInterval(shiftStart, { start, end }) || isWithinInterval(shiftEnd, { start, end })
    })
    if (isOnLeave) return false

    const hasOverlap = staff.shifts.some((s: any) => {
        const sStart = new Date(s.startTime)
        const sEnd = new Date(s.endTime)
        return (shiftStart < sEnd && shiftEnd > sStart)
    })
    if (hasOverlap) return false

    const hasRestConflict = staff.shifts.some((s: any) => {
        const sEnd = new Date(s.endTime)
        const sStart = new Date(s.startTime)

        const hoursAfterPrevious = differenceInHours(shiftStart, sEnd)
        if (hoursAfterPrevious >= 0 && hoursAfterPrevious < 11) return true

        const hoursBeforeNext = differenceInHours(sStart, shiftEnd)
        if (hoursBeforeNext >= 0 && hoursBeforeNext < 11) return true

        return false
    })
    if (hasRestConflict) return false

    return true
}
