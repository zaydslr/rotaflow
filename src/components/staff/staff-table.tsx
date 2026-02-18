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
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Star, Award, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface StaffTableProps {
    staff: StaffMember[]
    onEdit: (staff: StaffMember) => void
    onDelete: (id: string) => void
}

export function StaffTable({ staff = [], onEdit, onDelete }: StaffTableProps) {
    if (!staff || !Array.isArray(staff)) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground">No staff data available</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="font-bold">Staff member</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="font-bold">Rating</TableHead>
                        <TableHead className="font-bold">Role & Contract</TableHead>
                        <TableHead className="font-bold">Skills</TableHead>
                        <TableHead className="w-[120px] text-right font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                No staff members yet. Add your first clinical team member.
                            </TableCell>
                        </TableRow>
                    ) : (
                        staff.map((member) => {
                            const isOff = member.availability && member.availability.length > 0;

                            return (
                                <TableRow key={member.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base">
                                                {member.firstName} {member.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{member.email || 'No email set'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {isOff ? (
                                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                <AlertCircle className="h-3 w-3" /> ON LEAVE
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                                                AVAILABLE
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-3.5 w-3.5",
                                                        (member.rating || 0) >= i ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="secondary" className="w-fit text-[10px] uppercase font-bold tracking-wider">
                                                {member.role}
                                            </Badge>
                                            <span className="text-xs font-medium text-muted-foreground">{member.contractHours}h week</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {member.skills?.length > 0 ? (
                                                member.skills.slice(0, 2).map((skill, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] py-0 bg-primary/5">
                                                        {skill}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">No skills listed</span>
                                            )}
                                            {member.skills?.length > 2 && (
                                                <Badge variant="outline" className="text-[10px] py-0">+{member.skills.length - 2}</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                                <Link href={`/staff/${member.id}/availability`}>
                                                    <Calendar className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => onEdit(member)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => onDelete(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
