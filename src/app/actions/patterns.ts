'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { CreateShiftPatternInput, UpdateShiftPatternInput } from '@/types/rota'

export async function getPatterns() {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.shiftPattern.findMany({
        where: { workspaceId: user.workspaceId },
        orderBy: { createdAt: 'asc' }
    })
}

export async function createPattern(data: CreateShiftPatternInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const pattern = await prisma.shiftPattern.create({
        data: {
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            color: data.color,
            requiredStaff: data.requiredStaff || 1,
            unfairnessWeight: data.unfairnessWeight || 1.0,
            targetRating: data.targetRating || 3.0,
            requiredRole: data.requiredRole || 'STAFF',
            demandType: (data as any).demandType || 'FIXED',
            workspaceId: user.workspaceId
        }
    })

    revalidatePath('/settings/patterns')
    return pattern
}

export async function updatePattern(data: UpdateShiftPatternInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const pattern = await prisma.shiftPattern.update({
        where: { id: data.id },
        data: {
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            color: data.color,
            requiredStaff: data.requiredStaff,
            unfairnessWeight: data.unfairnessWeight,
            targetRating: data.targetRating,
            requiredRole: data.requiredRole,
            demandType: (data as any).demandType
        }
    })

    revalidatePath('/settings/patterns')
    return pattern
}

export async function deletePattern(id: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    // Only delete if no shifts use it
    const shiftCount = await prisma.shift.count({
        where: { patternId: id }
    })

    if (shiftCount > 0) {
        throw new Error('Cannot delete pattern that is used by existing shifts')
    }

    await prisma.shiftPattern.delete({
        where: { id }
    })

    revalidatePath('/settings/patterns')
}

export async function setDefaultPatterns() {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const defaults = [
        { name: 'Day', startTime: '07:00', endTime: '19:30', color: '#3b82f6', isDefault: true },
        { name: 'Night', startTime: '19:00', endTime: '07:30', color: '#1e3a8a', isDefault: true },
    ]

    for (const def of defaults) {
        await prisma.shiftPattern.upsert({
            where: {
                workspaceId_name: {
                    workspaceId: user.workspaceId,
                    name: def.name
                }
            },
            update: {},
            create: {
                ...def,
                workspaceId: user.workspaceId
            }
        })
    }

    revalidatePath('/settings/patterns')
}
