'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { startOfWeek, addDays, isBefore, startOfToday } from 'date-fns'
import { RotaCalendar, Shift, Pattern } from '@/components/rota/rota-calendar'
import { AssignShiftModal } from '@/components/rota/assign-shift-modal'
import {
    getShiftsForWeek,
    createShift,
    deleteShift,
    bulkCreateShifts,
    assignStaffToShift,
    removeStaffFromShift
} from '@/app/actions/rota'

interface RotaClientProps {
    initialShifts: Shift[]
    patterns: Pattern[]
    staffList: any[]
}

export function RotaClient({ initialShifts, patterns, staffList }: RotaClientProps) {
    const [shifts, setShifts] = useState<Shift[]>(initialShifts)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [activeShift, setActiveShift] = useState<any>(null)

    async function handleDateChange(date: Date) {
        setCurrentDate(date)
        try {
            const weekShifts = await getShiftsForWeek(date)
            setShifts(weekShifts as any)
        } catch (error) {
            toast.error('Failed to fetch shifts')
        }
    }

    async function handleCreateShift(date: Date, patternId: string) {
        try {
            const newShift = await createShift({ date, patternId })
            setShifts(prev => [...prev, newShift as any])
            toast.success('Shift added')
        } catch (error) {
            toast.error('Failed to create shift')
        }
    }

    async function handleDeleteShift(id: string) {
        try {
            await deleteShift(id)
            setShifts(prev => prev.filter(s => s.id !== id))
            toast.success('Shift deleted')
        } catch (error) {
            toast.error('Failed to delete shift')
        }
    }

    async function handleGenerateWeek() {
        const monday = startOfWeek(currentDate, { weekStartsOn: 1 })
        const sunday = addDays(monday, 6)

        // Find default patterns
        const defaultPatternIds = patterns.map(p => p.id)

        if (defaultPatternIds.length === 0) {
            toast.error('No shift patterns defined. Add patterns in settings first.')
            return
        }

        if (!confirm('This will generate shifts for all patterns across the entire week. Continue?')) return

        try {
            await bulkCreateShifts({
                dateRange: { start: monday, end: sunday },
                patternIds: defaultPatternIds
            })
            const weekShifts = await getShiftsForWeek(currentDate)
            setShifts(weekShifts as any)
            toast.success('Generated default shifts for the week')
        } catch (error) {
            toast.error('Failed to generate shifts')
        }
    }

    async function handleAssign(staffId: string) {
        if (!activeShift) return
        try {
            const updated = await assignStaffToShift(activeShift.id, staffId)
            setShifts(prev => prev.map(s => s.id === activeShift.id ? (updated as any) : s))
            toast.success('Staff assigned')
        } catch (error: any) {
            toast.error(error.message || 'Assignment failed')
        }
    }

    async function handleRemoveStaff(shiftId: string) {
        try {
            await removeStaffFromShift(shiftId)
            setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, staff: null } : s))
            toast.success('Staff removed')
        } catch (error) {
            toast.error('Failed to remove staff')
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Rota Calendar</h1>
                <p className="text-muted-foreground">Manage shift assignments and coverage</p>
            </div>

            <RotaCalendar
                shifts={shifts}
                patterns={patterns}
                currentDate={currentDate}
                onDateChange={handleDateChange}
                onCreateShift={handleCreateShift}
                onDeleteShift={handleDeleteShift}
                onAssignStaff={(shift) => {
                    setActiveShift(shift)
                    setIsAssignModalOpen(true)
                }}
                onRemoveStaff={handleRemoveStaff}
                onGenerateWeek={handleGenerateWeek}
                onAutoScheduleSuccess={async () => {
                    const weekShifts = await getShiftsForWeek(currentDate)
                    setShifts(weekShifts as any)
                }}
            />

            <AssignShiftModal
                open={isAssignModalOpen}
                onOpenChange={setIsAssignModalOpen}
                shift={activeShift}
                staffList={staffList}
                onAssign={handleAssign}
            />
        </div>
    )
}
