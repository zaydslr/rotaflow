'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSkills() {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.skill.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function createSkill(name: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const skill = await prisma.skill.create({
        data: { name }
    })

    revalidatePath('/skills')
    return skill
}

export async function deleteSkill(id: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.skill.delete({
        where: { id }
    })

    revalidatePath('/skills')
}

export async function assignSkillToStaff(staffId: string, skillId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.skillToStaff.upsert({
        where: {
            staffId_skillId: {
                staffId,
                skillId
            }
        },
        update: {},
        create: {
            staffId,
            skillId
        }
    })

    revalidatePath('/staff')
    revalidatePath(`/staff/${staffId}/availability`)
}

export async function removeSkillFromStaff(staffId: string, skillId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.skillToStaff.delete({
        where: {
            staffId_skillId: {
                staffId,
                skillId
            }
        }
    })

    revalidatePath('/staff')
}

export async function updateStaffRating(staffId: string, rating: number) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.staff.update({
        where: { id: staffId },
        data: { rating }
    })

    revalidatePath('/staff')
}
