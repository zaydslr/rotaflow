'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScheduleResult } from '@/app/actions/scheduler'
import { CheckCircle2, AlertTriangle, User, BrainCircuit } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SchedulePreviewProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    result: ScheduleResult
    onConfirm: () => void
}

export function SchedulePreview({ open, onOpenChange, result, onConfirm }: SchedulePreviewProps) {
    const successCount = result.assignments.length
    const unfilledCount = result.unfilled.length

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-green-600" />
                        Scheduling Preview (Zayd Method™)
                    </DialogTitle>
                    <DialogDescription>
                        Summary of proposed assignments for this week.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="p-4 rounded-xl border bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-bold text-green-800 dark:text-green-300">SUCCESSFUL</span>
                        </div>
                        <span className="text-3xl font-black text-green-600">{successCount}</span>
                        <p className="text-[10px] text-green-700/70 dark:text-green-400/70 uppercase font-bold">Assigned Shifts</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-bold text-amber-800 dark:text-amber-300">UNFILLED</span>
                        </div>
                        <span className="text-3xl font-black text-amber-600">{unfilledCount}</span>
                        <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 uppercase font-bold">Requires Attention</p>
                    </div>
                </div>

                <ScrollArea className="h-[300px] pr-4 border rounded-md p-4 bg-muted/30">
                    <div className="space-y-4">
                        {unfilledCount > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Unfilled Gaps</h4>
                                {result.unfilled.map((u, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded bg-background border border-amber-200 dark:border-amber-900/40">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Shift ID: {u.shiftId.slice(-6)}</span>
                                            <span className="text-xs text-amber-600 font-medium">{u.reason}</span>
                                        </div>
                                        <Badge variant="outline" className="text-amber-600 border-amber-200 uppercase text-[10px]">FIX REQUIRED</Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">New Assignments</h4>
                            {result.assignments.map((a, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded bg-background border">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">Staff ID: {a.staffId?.slice(-6)}</span>
                                            <span className="text-[10px] text-muted-foreground">Confidence Score: {(a.score || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none">ASSIGNED</Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Go Back & Edit
                    </Button>
                    <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700 shadow-xl">
                        Apply Assignments
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
