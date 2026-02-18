'use server'

import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { CreateBedInput, AssignPatientInput } from '@/types/bed'
import { BedStatus } from '@prisma/client'

export async function getBeds() {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const beds = await prisma.bed.findMany({
        where: { workspaceId: user.workspaceId },
        include: {
            assignments: {
                where: { endTime: null },
                orderBy: { startTime: 'desc' },
                take: 1,
                include: { procedure: true },
            }
        },
        orderBy: { name: 'asc' }
    })

    return beds.map(b => ({
        id: b.id,
        name: b.name,
        room: b.room,
        isIsolation: b.isIsolation,
        status: b.status as any,
        currentAssignment: b.assignments[0] ? {
            id: b.assignments[0].id,
            patientAcuity: b.assignments[0].patientAcuity as any,
            startTime: b.assignments[0].startTime,
            endTime: b.assignments[0].endTime,
            patientProcedure: b.assignments[0].patientProcedure,
            procedureId: b.assignments[0].procedureId,
            procedure: b.assignments[0].procedure,
        } : null,
        createdAt: b.createdAt
    }))
}

export async function createBed(data: CreateBedInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const bed = await prisma.bed.create({
        data: {
            name: data.name,
            room: data.room,
            isIsolation: data.isIsolation || false,
            status: (data.status as BedStatus) || BedStatus.AVAILABLE,
            workspaceId: user.workspaceId
        }
    })

    revalidatePath('/beds')
    return bed
}

export async function updateBed(id: string, data: Partial<CreateBedInput>) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const bed = await prisma.bed.update({
        where: { id },
        data: {
            name: data.name,
            room: data.room,
            isIsolation: data.isIsolation,
            status: data.status as BedStatus
        }
    })

    revalidatePath('/beds')
    return bed
}

export async function deleteBed(id: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    const activeAssignment = await prisma.bedAssignment.findFirst({
        where: { bedId: id, endTime: null }
    })

    if (activeAssignment) {
        throw new Error('Cannot delete bed with an active patient assignment')
    }

    await prisma.bed.delete({ where: { id } })
    revalidatePath('/beds')
}

export async function assignPatient(bedId: string, data: AssignPatientInput) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.$transaction(async (tx) => {
        const assignment = await tx.bedAssignment.create({
            data: {
                bedId,
                patientAcuity: data.patientAcuity,
                patientProcedure: data.patientProcedure,
                procedureId: data.procedureId || null,
                startTime: data.startTime,
            },
            include: { procedure: true },
        })

        await tx.bed.update({
            where: { id: bedId },
            data: { status: BedStatus.OCCUPIED }
        })

        revalidatePath('/beds')
        revalidatePath('/census')
        return assignment
    })
}

export async function dischargePatient(assignmentId: string) {
    const { user } = await validateRequest()
    if (!user) throw new Error('Unauthorized')

    return await prisma.$transaction(async (tx) => {
        const assignment = await tx.bedAssignment.update({
            where: { id: assignmentId },
            data: { endTime: new Date() }
        })

        await tx.bed.update({
            where: { id: assignment.bedId },
            data: { status: BedStatus.AVAILABLE }
        })

        revalidatePath('/beds')
        revalidatePath('/census')
        return assignment
    })
}
