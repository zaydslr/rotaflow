'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { startOfDay } from 'date-fns'

export async function getStaffAvailability(staffId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.availability.findMany({
        where: { staffId },
        orderBy: { startDate: 'asc' }
    })
}

export async function addAvailability(data: {
    staffId: string
    type: string
    startDate: Date
    endDate: Date
    description?: string
}) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const availability = await prisma.availability.create({
        data: {
            staffId: data.staffId,
            type: data.type,
            startDate: startOfDay(data.startDate),
            endDate: startOfDay(data.endDate),
            description: data.description
        }
    })

    revalidatePath(`/staff/${data.staffId}/availability`)
    revalidatePath('/staff')
    return availability
}

export async function deleteAvailability(id: string, staffId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.availability.delete({
        where: { id }
    })

    revalidatePath(`/staff/${staffId}/availability`)
    revalidatePath('/staff')
}
