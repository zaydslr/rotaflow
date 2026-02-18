'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface CreateProcedureInput {
    name: string
    defaultAcuity: 1 | 2 | 3 | 4 | 5
    defaultDuration: number
    color: string
}

export async function getProcedures() {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.procedure.findMany({
        where: { workspaceId: user.workspaceId },
        orderBy: { name: 'asc' },
    })
}

export async function createProcedure(data: CreateProcedureInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const procedure = await prisma.procedure.create({
        data: {
            name: data.name,
            defaultAcuity: data.defaultAcuity,
            defaultDuration: data.defaultDuration,
            color: data.color,
            workspaceId: user.workspaceId,
        },
    })

    revalidatePath('/settings/procedures')
    return procedure
}

export async function updateProcedure(id: string, data: Partial<CreateProcedureInput>) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const procedure = await prisma.procedure.update({
        where: { id },
        data: {
            name: data.name,
            defaultAcuity: data.defaultAcuity,
            defaultDuration: data.defaultDuration,
            color: data.color,
        },
    })

    revalidatePath('/settings/procedures')
    return procedure
}

export async function deleteProcedure(id: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    await prisma.procedure.delete({ where: { id } })
    revalidatePath('/settings/procedures')
}
