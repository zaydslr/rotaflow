'use client'

import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, startOfToday } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, UserPlus, UserMinus, Trash2, Wand2, Calendar as CalendarIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AutoScheduleButton } from '@/components/scheduler/auto-schedule-button'

export interface Shift {
    id: string
    date: Date
    startTime: Date
    endTime: Date
    status: string
    pattern: {
        id: string
        name: string
        color: string
        startTime: string
        endTime: string
    }
    staff?: {
        id: string
        firstName: string
        lastName: string
    } | null
}

export interface Pattern {
    id: string
    name: string
    color: string
}

interface RotaCalendarProps {
    shifts: Shift[]
    patterns: Pattern[]
    currentDate: Date
    onDateChange: (date: Date) => void
    onCreateShift: (date: Date, patternId: string) => Promise<void>
    onDeleteShift: (id: string) => Promise<void>
    onAssignStaff: (shift: any) => void
    onRemoveStaff: (shiftId: string) => Promise<void>
    onGenerateWeek: () => Promise<void>
    onAutoScheduleSuccess: () => void
}

export function RotaCalendar({
    shifts,
    patterns,
    currentDate,
    onDateChange,
    onCreateShift,
    onDeleteShift,
    onAssignStaff,
    onRemoveStaff,
    onGenerateWeek,
    onAutoScheduleSuccess,
}: RotaCalendarProps) {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, 6),
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button variant="ghost" size="icon" onClick={() => onDateChange(addDays(currentDate, -7))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="px-3" onClick={() => onDateChange(new Date())}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDateChange(addDays(currentDate, 7))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        {format(startDate, 'MMMM yyyy')}
                    </h2>
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={onGenerateWeek} variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Create Shifts
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Populate the week with default shifts</p>
                        </TooltipContent>
                    </Tooltip>

                    <AutoScheduleButton
                        weekStart={startDate}
                        onSuccess={onAutoScheduleSuccess}
                    />
                </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((day) => {
                    const dayShifts = shifts.filter((s) => isSameDay(new Date(s.date), day))
                    const isToday = isSameDay(day, startOfToday())

                    return (
                        <div key={day.toString()} className="flex flex-col gap-3">
                            <div className={cn(
                                "p-3 rounded-lg text-center border-b-2 transition-colors",
                                isToday ? "bg-primary/5 border-primary" : "bg-muted/30 border-transparent"
                            )}>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {format(day, 'EEE')}
                                </p>
                                <p className={cn(
                                    "text-2xl font-black",
                                    isToday ? "text-primary" : "text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </p>
                            </div>

                            <div className="space-y-2 min-h-[300px]">
                                {dayShifts.map((shift) => (
                                    <Card
                                        key={shift.id}
                                        className="group border-l-4 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-95"
                                        style={{ borderLeftColor: shift.pattern.color }}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold truncate pr-6">{shift.pattern.name}</span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="h-3 w-3" rotate={45} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => onDeleteShift(shift.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Shift
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="text-[10px] text-muted-foreground mb-3 font-medium">
                                                {shift.pattern.startTime} - {shift.pattern.endTime}
                                            </div>

                                            {shift.staff ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Users className="h-3 w-3 text-primary" />
                                                        </div>
                                                        <span className="text-xs font-medium">
                                                            {shift.staff.lastName}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                        onClick={() => onRemoveStaff(shift.id)}
                                                    >
                                                        <UserMinus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full h-7 text-[10px] bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800"
                                                    onClick={() => onAssignStaff(shift)}
                                                >
                                                    <UserPlus className="mr-1 h-3 w-3" /> UNASSIGNED
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 h-12 flex flex-col gap-0.5 group"
                                        >
                                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                            <span className="text-[9px] text-muted-foreground group-hover:text-primary font-bold uppercase">Add Shift</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {patterns.map(pattern => (
                                            <DropdownMenuItem
                                                key={pattern.id}
                                                onClick={() => onCreateShift(day, pattern.id)}
                                            >
                                                <div
                                                    className="h-2 w-2 rounded-full mr-2"
                                                    style={{ backgroundColor: pattern.color }}
                                                />
                                                {pattern.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
