'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from '@/components/ui/form'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Procedure } from '@/types/bed'
import { CreateProcedureInput } from '@/app/actions/procedures'
import { ACUITY_LABELS } from '@/lib/census-engine'

const procedureSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    defaultAcuity: z.number().min(1).max(5),
    defaultDuration: z.number().min(1),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color'),
})

type ProcedureFormValues = z.infer<typeof procedureSchema>

interface ProcedureFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateProcedureInput) => Promise<void>
    initialData?: Procedure | null
}

export function ProcedureForm({ open, onOpenChange, onSubmit, initialData }: ProcedureFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ProcedureFormValues>({
        resolver: zodResolver(procedureSchema),
        defaultValues: {
            name: initialData?.name || '',
            defaultAcuity: initialData?.defaultAcuity || 2,
            defaultDuration: initialData?.defaultDuration || 3,
            color: initialData?.color || '#6366f1',
        },
    })

    async function handleActualSubmit(values: ProcedureFormValues) {
        setIsLoading(true)
        try {
            await onSubmit(values as any)
            form.reset()
            onOpenChange(false)
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Procedure' : 'Add Procedure'}</DialogTitle>
                    <DialogDescription>Define a clinical procedure for the library.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleActualSubmit)} className="space-y-4 py-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Procedure Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Hip Replacement, Appendectomy" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="defaultAcuity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Acuity</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(parseInt(v))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map(level => (
                                                    <SelectItem key={level} value={level.toString()}>
                                                        {level} — {ACUITY_LABELS[level]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="defaultDuration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Duration (days)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Colour</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input type="color" className="p-1 w-12 h-10" {...field} />
                                            <Input placeholder="#6366f1" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add Procedure'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
