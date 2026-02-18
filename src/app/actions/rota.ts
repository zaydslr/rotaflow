'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { startOfDay, endOfDay, addDays, parse, format, isBefore, startOfWeek, endOfWeek } from 'date-fns'

export async function getShiftsForWeek(startDate: Date) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const start = startOfWeek(startDate, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(startDate, { weekStartsOn: 1 }) // Sunday

    return await prisma.shift.findMany({
        where: {
            workspaceId: user.workspaceId,
            date: {
                gte: start,
                lte: end
            }
        },
        include: {
            pattern: true,
            staff: true
        },
        orderBy: {
            startTime: 'asc'
        }
    })
}

export async function createShift(data: { date: Date, patternId: string }) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const pattern = await prisma.shiftPattern.findUnique({
        where: { id: data.patternId }
    })

    if (!pattern) throw new Error('Pattern not found')

    const shiftDate = startOfDay(data.date)

    // Calculate start/end times
    const [sH, sM] = pattern.startTime.split(':').map(Number)
    const [eH, eM] = pattern.endTime.split(':').map(Number)

    const startTime = new Date(shiftDate)
    startTime.setHours(sH, sM, 0, 0)

    let endTime = new Date(shiftDate)
    endTime.setHours(eH, eM, 0, 0)

    // If end time is before start time, it's a night shift ending next day
    if (isBefore(endTime, startTime)) {
        endTime = addDays(endTime, 1)
    }

    const shift = await prisma.shift.create({
        data: {
            date: shiftDate,
            patternId: data.patternId,
            startTime,
            endTime,
            workspaceId: user.workspaceId,
            status: 'DRAFT',
            unfairnessWeight: pattern.unfairnessWeight,
            targetRating: pattern.targetRating,
            requiredRole: pattern.requiredRole
        },
        include: {
            pattern: true,
            staff: true
        }
    })

    revalidatePath('/rota')
    return shift
}

export async function deleteShift(shiftId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.shift.delete({
        where: { id: shiftId, workspaceId: user.workspaceId }
    })

    revalidatePath('/rota')
}

export async function bulkCreateShifts(data: { dateRange: { start: Date, end: Date }, patternIds: string[] }) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const patterns = await prisma.shiftPattern.findMany({
        where: { id: { in: data.patternIds }, workspaceId: user.workspaceId }
    })

    const shiftsToCreate = []
    let currentDate = startOfDay(data.dateRange.start)
    const endDate = startOfDay(data.dateRange.end)

    while (!isBefore(endDate, currentDate)) {
        for (const pattern of patterns) {
            const [sH, sM] = pattern.startTime.split(':').map(Number)
            const [eH, eM] = pattern.endTime.split(':').map(Number)

            const startTime = new Date(currentDate)
            startTime.setHours(sH, sM, 0, 0)

            let endTime = new Date(currentDate)
            endTime.setHours(eH, eM, 0, 0)

            if (isBefore(endTime, startTime)) {
                endTime = addDays(endTime, 1)
            }

            shiftsToCreate.push({
                date: currentDate,
                patternId: pattern.id,
                startTime,
                endTime,
                workspaceId: user.workspaceId,
                status: 'DRAFT' as const,
                unfairnessWeight: pattern.unfairnessWeight,
                targetRating: pattern.targetRating,
                requiredRole: pattern.requiredRole
            })
        }
        currentDate = addDays(currentDate, 1)
    }

    await prisma.shift.createMany({
        data: shiftsToCreate
    })

    revalidatePath('/rota')
}

export async function assignStaffToShift(shiftId: string, staffId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    // Check for conflicts (staff already has a shift on this day)
    const shift = await prisma.shift.findUnique({
        where: { id: shiftId }
    })

    if (!shift) throw new Error('Shift not found')

    const conflict = await prisma.shift.findFirst({
        where: {
            staffId,
            date: shift.date,
            id: { not: shiftId }
        }
    })

    if (conflict) {
        throw new Error('Staff already assigned to another shift on this day')
    }

    const updatedShift = await prisma.shift.update({
        where: { id: shiftId },
        data: { staffId },
        include: { staff: true, pattern: true }
    })

    revalidatePath('/rota')
    return updatedShift
}

export async function removeStaffFromShift(shiftId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.shift.update({
        where: { id: shiftId },
        data: { staffId: null }
    })

    revalidatePath('/rota')
}
