'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { CreateStaffInput, UpdateStaffInput } from '@/types/staff'

export async function getStaff() {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const staff = await prisma.staff.findMany({
        where: { workspaceId: user.workspaceId },
        include: {
            SkillToStaff: {
                include: {
                    skill: true
                }
            },
            availability: {
                where: {
                    endDate: { gte: new Date() }
                },
                take: 1
            }
        },
        orderBy: { lastName: 'asc' }
    })

    return staff.map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email || '',
        contractHours: s.contractHours,
        role: s.role || 'STAFF',
        skills: s.SkillToStaff?.map(ss => ss.skill?.name).filter(Boolean) || [],
        rating: s.rating,
        totalHoursThisMonth: s.totalHoursThisMonth,
        availability: s.availability,
        createdAt: s.createdAt
    }))
}

export async function getStaffById(id: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.staff.findUnique({
        where: { id, workspaceId: user.workspaceId },
        include: {
            SkillToStaff: {
                include: {
                    skill: true
                }
            },
            availability: true
        }
    })
}

export async function createStaff(data: CreateStaffInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    // Create the staff member with the provided role
    const staff = await prisma.staff.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contractHours: data.contractHours,
            role: data.role, // Added role
            workspaceId: user.workspaceId
        }
    })

    revalidatePath('/staff')
    return staff
}

export async function updateStaff(data: UpdateStaffInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const staff = await prisma.staff.update({
        where: { id: data.id },
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            contractHours: data.contractHours,
            role: data.role // Added role
        }
    })

    revalidatePath('/staff')
    return staff
}

export async function deleteStaff(id: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.staff.delete({
        where: { id }
    })

    revalidatePath('/staff')
}
