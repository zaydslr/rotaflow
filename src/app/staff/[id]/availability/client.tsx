'use client'

import { useState } from 'react'
import { format, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isWithinInterval } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { addAvailability, deleteAvailability } from '@/app/actions/availability'
import { AvailabilityForm } from '@/components/staff/availability-form'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Availability {
    id: string
    type: 'HOLIDAY' | 'SICK' | 'UNAVAILABLE' | 'STUDY'
    startDate: Date
    endDate: Date
    description?: string
}

interface AvailabilityClientProps {
    staff: any
    initialAvailability: Availability[]
}

const TYPE_COLORS = {
    HOLIDAY: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    SICK: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    STUDY: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    UNAVAILABLE: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
}

export function AvailabilityClient({ staff, initialAvailability }: AvailabilityClientProps) {
    const [availability, setAvailability] = useState(initialAvailability)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [isFormOpen, setIsFormOpen] = useState(false)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    async function handleAdd(data: any) {
        try {
            const newAvail = await addAvailability({ ...data, staffId: staff.id })
            setAvailability(prev => [...prev, newAvail as any])
            toast.success('Availability record added')
        } catch (error) {
            toast.error('Failed to add record')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to remove this record?')) return
        try {
            await deleteAvailability(id, staff.id)
            setAvailability(prev => prev.filter(a => a.id !== id))
            toast.success('Record removed')
        } catch (error) {
            toast.error('Failed to remove record')
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">{staff.firstName} {staff.lastName}</h1>
                    <p className="text-muted-foreground font-medium">Availability & Leave Management</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Leave / Absence
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                            <CardDescription>Staff schedule and leave calendar</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addDays(monthStart, -1))}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addDays(monthEnd, 1))}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="p-2 text-center text-xs font-bold bg-muted border-b border-r last:border-r-0 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((day, i) => {
                                const dayAvail = availability.filter(a =>
                                    isWithinInterval(day, { start: new Date(a.startDate), end: new Date(a.endDate) })
                                )
                                const isCurrentMonth = isSameDay(startOfMonth(day), monthStart)

                                return (
                                    <div
                                        key={day.toString()}
                                        className={cn(
                                            "min-h-[100px] p-2 border-b border-r last:border-r-0 flex flex-col gap-1 transition-colors",
                                            !isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-background"
                                        )}
                                    >
                                        <span className="text-sm font-medium">{format(day, 'd')}</span>
                                        {dayAvail.map(a => (
                                            <div
                                                key={a.id}
                                                className={cn(
                                                    "text-[10px] p-1 rounded font-bold border truncate",
                                                    TYPE_COLORS[a.type as keyof typeof TYPE_COLORS]
                                                )}
                                                title={a.description}
                                            >
                                                {a.type}
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Records</CardTitle>
                        <CardDescription>Recent and future leave / absences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {availability.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    No availability records found.
                                </div>
                            ) : (
                                availability
                                    .filter(a => new Date(a.endDate) >= startOfToday())
                                    .map(a => (
                                        <div key={a.id} className="flex items-start justify-between p-3 border rounded-lg group hover:border-primary transition-all">
                                            <div className="space-y-1">
                                                <Badge className={cn("mb-1", TYPE_COLORS[a.type as keyof typeof TYPE_COLORS])}>
                                                    {a.type}
                                                </Badge>
                                                <p className="text-sm font-bold">
                                                    {format(new Date(a.startDate), 'MMM d')} - {format(new Date(a.endDate), 'MMM d, yyyy')}
                                                </p>
                                                {a.description && (
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                        "{a.description}"
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(a.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AvailabilityForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleAdd}
            />
        </div>
    )
}

function startOfToday() {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}
