'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { StaffMember, CreateStaffInput } from '@/types/staff'
import { StaffTable } from '@/components/staff/staff-table'
import { StaffForm } from '@/components/staff/staff-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createStaff, updateStaff, deleteStaff } from '@/app/actions/staff'

interface StaffClientProps {
    initialStaff: StaffMember[]
}

export function StaffClient({ initialStaff = [] }: StaffClientProps) {
    const [staff, setStaff] = useState<StaffMember[]>(initialStaff || [])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

    // Log for debugging
    useEffect(() => {
        console.log('StaffClient mounted with:', initialStaff)
    }, [])

    async function handleCreate(data: CreateStaffInput) {
        try {
            const newStaff = await createStaff(data)
            setStaff(prev => [...prev, newStaff as StaffMember])
            toast.success('Staff member added successfully')
        } catch (error) {
            console.error('Create error:', error)
            toast.error('Failed to add staff member')
        }
    }

    async function handleUpdate(data: CreateStaffInput) {
        if (!editingStaff) return

        try {
            const updated = await updateStaff({ ...data, id: editingStaff.id })
            setStaff(prev => prev.map(s => s.id === editingStaff.id ? updated as StaffMember : s))
            toast.success('Staff member updated successfully')
        } catch (error) {
            console.error('Update error:', error)
            toast.error('Failed to update staff member')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this staff member?')) return

        try {
            await deleteStaff(id)
            setStaff(prev => prev.filter(s => s.id !== id))
            toast.success('Staff member deleted successfully')
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete staff member')
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Staff Management</CardTitle>
                    <Button onClick={() => {
                        setEditingStaff(null)
                        setIsFormOpen(true)
                    }}>
                        Add Staff Member
                    </Button>
                </CardHeader>
                <CardContent>
                    <StaffTable
                        staff={staff}
                        onEdit={(member) => {
                            setEditingStaff(member)
                            setIsFormOpen(true)
                        }}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>

            <StaffForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={editingStaff ? handleUpdate : handleCreate}
                initialData={editingStaff}
            />
        </div>
    )
}