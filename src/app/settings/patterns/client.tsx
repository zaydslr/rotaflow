'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ShiftPattern, CreateShiftPatternInput } from '@/types/rota'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react'
import { createPattern, updatePattern, deletePattern, setDefaultPatterns } from '@/app/actions/patterns'
import { PatternForm } from '@/components/patterns/pattern-form'

interface PatternsClientProps {
    initialPatterns: ShiftPattern[]
}

export function PatternsClient({ initialPatterns }: PatternsClientProps) {
    const [patterns, setPatterns] = useState(initialPatterns)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null)

    async function handleCreate(data: CreateShiftPatternInput) {
        try {
            const newPattern = await createPattern(data)
            setPatterns(prev => [...prev, newPattern as any])
            toast.success('Pattern created')
        } catch (error) {
            toast.error('Failed to create pattern')
        }
    }

    async function handleUpdate(data: CreateShiftPatternInput) {
        if (!editingPattern) return
        try {
            const updated = await updatePattern({ ...data, id: editingPattern.id })
            setPatterns(prev => prev.map(p => p.id === editingPattern.id ? (updated as any) : p))
            toast.success('Pattern updated')
        } catch (error) {
            toast.error('Failed to update pattern')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure? This cannot be undone if shifts are already generated.')) return
        try {
            await deletePattern(id)
            setPatterns(prev => prev.filter(p => p.id !== id))
            toast.success('Pattern deleted')
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete pattern')
        }
    }

    async function handleSetDefaults() {
        try {
            await setDefaultPatterns()
            window.location.reload() // Simplest way to refresh the state from server
        } catch (error) {
            toast.error('Failed to set defaults')
        }
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Shift Patterns</h1>
                    <p className="text-muted-foreground">Define the standard shifts for your ward</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSetDefaults}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Reset to Defaults
                    </Button>
                    <Button onClick={() => {
                        setEditingPattern(null)
                        setIsFormOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Pattern
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {patterns.length === 0 ? (
                    <Card className="col-span-full py-12 text-center text-muted-foreground">
                        No patterns defined. Click "Reset to Defaults" to seed standard shifts.
                    </Card>
                ) : (
                    patterns.map((pattern) => (
                        <Card key={pattern.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: pattern.color }}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{pattern.name}</CardTitle>
                                        <CardDescription>
                                            {pattern.startTime} - {pattern.endTime}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-1 border rounded-md p-1 bg-muted/50">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                            setEditingPattern(pattern)
                                            setIsFormOpen(true)
                                        }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(pattern.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Staff Required:</span>
                                    <span className="font-bold">{pattern.requiredStaff}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <PatternForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={editingPattern ? handleUpdate : handleCreate}
                initialData={editingPattern}
            />
        </div>
    )
}
