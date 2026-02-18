'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wand2, Loader2 } from 'lucide-react'
import { autoScheduleWeek, ScheduleResult } from '@/app/actions/scheduler'
import { toast } from 'sonner'
import { SchedulePreview } from './schedule-preview'

interface AutoScheduleButtonProps {
    weekStart: Date
    onSuccess: () => void
}

export function AutoScheduleButton({ weekStart, onSuccess }: AutoScheduleButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<ScheduleResult | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    async function handleAutoSchedule() {
        setIsLoading(true)
        try {
            const res = await autoScheduleWeek(weekStart)
            setResult(res)
            setIsPreviewOpen(true)
            toast.success('Auto-schedule generation complete')
        } catch (error: any) {
            toast.error(error.message || 'Auto-scheduling failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                onClick={handleAutoSchedule}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Running Zayd Method™...' : 'Auto-Schedule Week'}
            </Button>

            {result && (
                <SchedulePreview
                    open={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    result={result}
                    onConfirm={() => {
                        setIsPreviewOpen(false)
                        onSuccess()
                    }}
                />
            )}
        </>
    )
}
