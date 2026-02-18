'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AssignPatientInput, Procedure } from '@/types/bed'
import { getProcedures } from '@/app/actions/procedures'
import { ACUITY_LABELS, ACUITY_COLORS } from '@/lib/census-engine'
import { FlaskConical, PenLine } from 'lucide-react'

const assignmentSchema = z.object({
    patientAcuity: z.number().min(1).max(5),
    patientProcedure: z.string().optional(),
    procedureId: z.string().optional(),
    startTime: z.date(),
})

type AssignmentFormValues = z.infer<typeof assignmentSchema>

interface AssignmentFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: AssignPatientInput) => Promise<void>
    bedName: string
}

export function AssignmentForm({ open, onOpenChange, onSubmit, bedName }: AssignmentFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [procedures, setProcedures] = useState<Procedure[]>([])
    const [useLibrary, setUseLibrary] = useState(true)

    useEffect(() => {
        if (open) {
            getProcedures().then(p => setProcedures(p as any)).catch(() => { })
        }
    }, [open])

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            patientAcuity: 2,
            patientProcedure: '',
            procedureId: undefined,
            startTime: new Date(),
        },
    })

    const selectedProcedureId = form.watch('procedureId')
    const selectedProcedure = procedures.find(p => p.id === selectedProcedureId)

    // Auto-fill acuity when a procedure is selected
    useEffect(() => {
        if (selectedProcedure) {
            form.setValue('patientAcuity', selectedProcedure.defaultAcuity)
            form.setValue('patientProcedure', selectedProcedure.name)
        }
    }, [selectedProcedureId])

    async function handleActualSubmit(values: AssignmentFormValues) {
        setIsLoading(true)
        try {
            await onSubmit({
                patientAcuity: values.patientAcuity as any,
                patientProcedure: values.patientProcedure,
                procedureId: values.procedureId,
                startTime: values.startTime,
            })
            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to assign patient:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const currentAcuity = form.watch('patientAcuity')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>Assign Patient to {bedName}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleActualSubmit)} className="space-y-5">

                        {/* Procedure source toggle */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={useLibrary ? 'default' : 'outline'}
                                onClick={() => setUseLibrary(true)}
                                className="flex-1"
                            >
                                <FlaskConical className="mr-2 h-3.5 w-3.5" />
                                From Library
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={!useLibrary ? 'default' : 'outline'}
                                onClick={() => { setUseLibrary(false); form.setValue('procedureId', undefined) }}
                                className="flex-1"
                            >
                                <PenLine className="mr-2 h-3.5 w-3.5" />
                                Free Text
                            </Button>
                        </div>

                        {/* Procedure library select */}
                        {useLibrary && (
                            <FormField
                                control={form.control}
                                name="procedureId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Procedure</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select from library…" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {procedures.length === 0 && (
                                                    <SelectItem value="_none" disabled>
                                                        No procedures in library yet
                                                    </SelectItem>
                                                )}
                                                {procedures.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: p.color }}
                                                            />
                                                            {p.name}
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                                (Level {p.defaultAcuity})
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedProcedure && (
                                            <FormDescription>
                                                Default acuity auto-filled to Level {selectedProcedure.defaultAcuity}
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Free-text procedure */}
                        {!useLibrary && (
                            <FormField
                                control={form.control}
                                name="patientProcedure"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Procedure / Reason for Admission</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Post-op Hip Replacement" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Acuity */}
                        <FormField
                            control={form.control}
                            name="patientAcuity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        Patient Acuity
                                        <Badge
                                            variant="outline"
                                            style={{
                                                borderColor: ACUITY_COLORS[currentAcuity],
                                                color: ACUITY_COLORS[currentAcuity],
                                            }}
                                        >
                                            Level {currentAcuity} — {ACUITY_LABELS[currentAcuity]}
                                        </Badge>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(v) => field.onChange(parseInt(v))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select acuity" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">1 — Stable / Routine</SelectItem>
                                            <SelectItem value="2">2 — Moderate</SelectItem>
                                            <SelectItem value="3">3 — Complex / High Monitoring</SelectItem>
                                            <SelectItem value="4">4 — Critical / One-to-One</SelectItem>
                                            <SelectItem value="5">5 — Life Sustaining / ECMO</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Assigning...' : 'Assign Patient'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
