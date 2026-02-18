'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'
import { buildCensusSnapshot, CensusSnapshot } from '@/lib/census-engine'
export type { CensusSnapshot } from '@/lib/census-engine'

export interface DailyCensusPoint {
    date: string
    occupied: number
    requiredNurses: number
    acuity1: number
    acuity2: number
    acuity3: number
    acuity4: number
    acuity5: number
}

/**
 * Get the census snapshot for right now (active assignments).
 */
export async function getCurrentCensus(): Promise<CensusSnapshot> {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const activeAssignments = await prisma.bedAssignment.findMany({
        where: {
            bed: { workspaceId: user.workspaceId },
            endTime: null,
        },
        select: { patientAcuity: true },
    })

    return buildCensusSnapshot(activeAssignments)
}

/**
 * Get daily census trend for the last N days.
 */
export async function getCensusTrend(days = 14): Promise<DailyCensusPoint[]> {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const points: DailyCensusPoint[] = []

    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)

        // Assignments that were active at any point during this day
        const assignments = await prisma.bedAssignment.findMany({
            where: {
                bed: { workspaceId: user.workspaceId },
                startTime: { lte: dayEnd },
                OR: [
                    { endTime: null },
                    { endTime: { gte: dayStart } },
                ],
            },
            select: { patientAcuity: true },
        })

        const snapshot = buildCensusSnapshot(assignments)

        points.push({
            date: format(date, 'MMM d'),
            occupied: snapshot.totalOccupied,
            requiredNurses: snapshot.requiredNurses,
            acuity1: snapshot.acuityCounts[1] || 0,
            acuity2: snapshot.acuityCounts[2] || 0,
            acuity3: snapshot.acuityCounts[3] || 0,
            acuity4: snapshot.acuityCounts[4] || 0,
            acuity5: snapshot.acuityCounts[5] || 0,
        })
    }

    return points
}
