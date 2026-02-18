'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, ShieldAlert, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Staff {
    id: string
    firstName: string
    lastName: string
    role: string
    skills: string[]
}

interface AssignShiftModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    shift: {
        id: string
        date: Date
        pattern: {
            name: string
            requiredStaff: number
        }
    } | null
    staffList: Staff[]
    onAssign: (staffId: string) => Promise<void>
}

export function AssignShiftModal({
    open,
    onOpenChange,
    shift,
    staffList,
    onAssign,
}: AssignShiftModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!shift) return null

    async function handleAssign(staffId: string) {
        setIsSubmitting(true)
        try {
            await onAssign(staffId)
            onOpenChange(false)
        } catch (error: any) {
            // Re-throwing or handling locally if needed, but client handles toast
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        Assign Staff to {shift.pattern.name}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {new Date(shift.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </DialogHeader>

                <div className="py-4">
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                            {staffList.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{staff.firstName} {staff.lastName}</p>
                                            <div className="flex gap-1 mt-1">
                                                <Badge variant="outline" className="text-[10px] py-0">
                                                    {staff.role}
                                                </Badge>
                                                {staff.skills.map(skill => (
                                                    <Badge key={skill} variant="secondary" className="text-[10px] py-0">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAssign(staff.id)}
                                        disabled={isSubmitting}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
