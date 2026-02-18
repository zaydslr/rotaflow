'use client'

import { StaffMember } from '@/types/staff'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface StaffTableProps {
    staff: StaffMember[]
    onEdit: (staff: StaffMember) => void
    onDelete: (id: string) => void
}

export function StaffTable({ staff = [], onEdit, onDelete }: StaffTableProps) {
    // Safely handle undefined staff
    if (!staff || !Array.isArray(staff)) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No staff data available
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contract Hours</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Skills</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No staff members yet. Add your first staff member to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        staff.map((member) => (
                            <TableRow key={member?.id || Math.random()}>
                                <TableCell className="font-medium">
                                    {member?.lastName}, {member?.firstName}
                                </TableCell>
                                <TableCell>{member?.email || '—'}</TableCell>
                                <TableCell>{member?.contractHours || 0}h/week</TableCell>
                                <TableCell className="capitalize">{member?.role?.toLowerCase() || 'staff'}</TableCell>
                                <TableCell>
                                    {member?.skills?.length > 0
                                        ? member.skills.join(', ')
                                        : '—'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => member && onEdit(member)}
                                            disabled={!member}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => member && onDelete(member.id)}
                                            disabled={!member}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}