'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Bed, CreateBedInput, AssignPatientInput } from '@/types/bed'
import { BedTable } from '@/components/bed/bed-table'
import { BedForm } from '@/components/bed/bed-form'
import { AssignmentForm } from '@/components/bed/assignment-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createBed, updateBed, deleteBed, assignPatient, dischargePatient } from '@/app/actions/bed'

interface BedClientProps {
    initialBeds: Bed[]
}

export function BedClient({ initialBeds }: BedClientProps) {
    const [beds, setBeds] = useState(initialBeds)
    const [isBedFormOpen, setIsBedFormOpen] = useState(false)
    const [isAssignFormOpen, setIsAssignFormOpen] = useState(false)
    const [editingBed, setEditingBed] = useState<Bed | null>(null)
    const [assigningBed, setAssigningBed] = useState<Bed | null>(null)

    async function handleCreateBed(data: CreateBedInput) {
        try {
            const newBed = await createBed(data)
            // Refresh beds
            setBeds(prev => [...prev, { ...newBed, currentAssignment: null, status: newBed.status as any }])
            toast.success('Bed added successfully')
        } catch (error) {
            toast.error('Failed to add bed')
        }
    }

    async function handleUpdateBed(data: CreateBedInput) {
        if (!editingBed) return
        try {
            const updated = await updateBed(editingBed.id, data)
            setBeds(prev => prev.map(b => b.id === editingBed.id ? { ...b, ...updated, status: updated.status as any } : b))
            toast.success('Bed updated successfully')
        } catch (error) {
            toast.error('Failed to update bed')
        }
    }

    async function handleDeleteBed(id: string) {
        if (!confirm('Are you sure you want to delete this bed?')) return
        try {
            await deleteBed(id)
            setBeds(prev => prev.filter(b => b.id !== id))
            toast.success('Bed deleted successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete bed')
        }
    }

    async function handleAssignPatient(data: AssignPatientInput) {
        if (!assigningBed) return
        try {
            const assignment = await assignPatient(assigningBed.id, data)
            setBeds(prev => prev.map(b => b.id === assigningBed.id ? {
                ...b,
                status: 'OCCUPIED',
                currentAssignment: {
                    id: assignment.id,
                    patientAcuity: assignment.patientAcuity as any,
                    startTime: assignment.startTime,
                    patientProcedure: assignment.patientProcedure
                }
            } : b))
            toast.success('Patient assigned successfully')
        } catch (error) {
            toast.error('Failed to assign patient')
        }
    }

    async function handleDischargePatient(assignmentId: string) {
        if (!confirm('Discharge this patient and mark bed as available?')) return
        try {
            await dischargePatient(assignmentId)
            setBeds(prev => prev.map(b => b.currentAssignment?.id === assignmentId ? { ...b, status: 'AVAILABLE', currentAssignment: null } : b))
            toast.success('Patient discharged successfully')
        } catch (error) {
            toast.error('Failed to discharge patient')
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Bed Management</h1>
                    <p className="text-muted-foreground">Monitor occupancy and manage patient flow</p>
                </div>
                <Button onClick={() => {
                    setEditingBed(null)
                    setIsBedFormOpen(true)
                }}>
                    Add New Bed
                </Button>
            </div>

            <BedTable
                beds={beds}
                onEdit={(bed) => {
                    setEditingBed(bed)
                    setIsBedFormOpen(true)
                }}
                onDelete={handleDeleteBed}
                onAssign={(bed) => {
                    setAssigningBed(bed)
                    setIsAssignFormOpen(true)
                }}
                onDischarge={handleDischargePatient}
            />

            <BedForm
                open={isBedFormOpen}
                onOpenChange={setIsBedFormOpen}
                onSubmit={editingBed ? handleUpdateBed : handleCreateBed}
                initialData={editingBed}
            />

            <AssignmentForm
                open={isAssignFormOpen}
                onOpenChange={setIsAssignFormOpen}
                onSubmit={handleAssignPatient}
                bedName={assigningBed?.name || ''}
            />
        </div>
    )
}
