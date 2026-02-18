'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Procedure } from '@/types/bed'
import { createProcedure, updateProcedure, deleteProcedure, CreateProcedureInput } from '@/app/actions/procedures'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProcedureForm } from '@/components/procedures/procedure-form'
import { Plus, Pencil, Trash2, FlaskConical } from 'lucide-react'
import { ACUITY_LABELS, ACUITY_COLORS } from '@/lib/census-engine'

interface ProcedureLibraryClientProps {
    initialProcedures: Procedure[]
}

export function ProcedureLibraryClient({ initialProcedures }: ProcedureLibraryClientProps) {
    const [procedures, setProcedures] = useState<Procedure[]>(initialProcedures)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)

    async function handleCreate(data: CreateProcedureInput) {
        try {
            const created = await createProcedure(data)
            setProcedures(prev => [...prev, created as any])
            toast.success('Procedure added')
        } catch {
            toast.error('Failed to add procedure')
        }
    }

    async function handleUpdate(data: CreateProcedureInput) {
        if (!editingProcedure) return
        try {
            const updated = await updateProcedure(editingProcedure.id, data)
            setProcedures(prev => prev.map(p => p.id === editingProcedure.id ? { ...p, ...updated } as any : p))
            toast.success('Procedure updated')
        } catch {
            toast.error('Failed to update procedure')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this procedure?')) return
        try {
            await deleteProcedure(id)
            setProcedures(prev => prev.filter(p => p.id !== id))
            toast.success('Procedure deleted')
        } catch {
            toast.error('Failed to delete procedure')
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FlaskConical className="h-8 w-8 text-primary" />
                        Procedure Library
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Pre-define clinical procedures with default acuity and duration for faster bed assignment.
                    </p>
                </div>
                <Button onClick={() => { setEditingProcedure(null); setIsFormOpen(true) }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Procedure
                </Button>
            </div>

            {procedures.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No procedures yet</p>
                        <p className="text-sm mt-1">Add procedures like "Hip Replacement" or "Appendectomy" to speed up bed assignments.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {procedures.map(proc => (
                        <Card key={proc.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: proc.color }}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base">{proc.name}</CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost" size="icon" className="h-7 w-7"
                                            onClick={() => { setEditingProcedure(proc); setIsFormOpen(true) }}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(proc.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center gap-3 pt-0">
                                <Badge
                                    variant="outline"
                                    style={{
                                        borderColor: ACUITY_COLORS[proc.defaultAcuity],
                                        color: ACUITY_COLORS[proc.defaultAcuity],
                                    }}
                                >
                                    Level {proc.defaultAcuity} — {ACUITY_LABELS[proc.defaultAcuity]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">~{proc.defaultDuration}d</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ProcedureForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={editingProcedure ? handleUpdate : handleCreate}
                initialData={editingProcedure}
            />
        </div>
    )
}
