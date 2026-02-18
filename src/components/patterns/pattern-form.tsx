'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CreateShiftPatternInput, ShiftPattern } from '@/types/rota'
import { Info } from 'lucide-react'

const patternSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (#RRGGBB)'),
    requiredStaff: z.number().min(1),
    unfairnessWeight: z.number().min(0.5).max(3.0),
    targetRating: z.number().min(1).max(5),
    requiredRole: z.enum(['MANAGER', 'DEPUTY', 'STAFF']),
    demandType: z.enum(['FIXED', 'CENSUS']),
})

type PatternFormValues = z.infer<typeof patternSchema>

interface PatternFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateShiftPatternInput) => Promise<void>
    initialData?: ShiftPattern | null
}

export function PatternForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: PatternFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<PatternFormValues>({
        resolver: zodResolver(patternSchema),
        defaultValues: {
            name: initialData?.name || '',
            startTime: initialData?.startTime || '07:00',
            endTime: initialData?.endTime || '19:30',
            color: initialData?.color || '#3b82f6',
            requiredStaff: initialData?.requiredStaff || 1,
            unfairnessWeight: initialData?.unfairnessWeight || 1.0,
            targetRating: initialData?.targetRating || 3.0,
            requiredRole: (initialData?.requiredRole as any) || 'STAFF',
            demandType: ((initialData as any)?.demandType as any) || 'FIXED',
        },
    })

    async function handleActualSubmit(values: PatternFormValues) {
        setIsLoading(true)
        try {
            await onSubmit(values as any)
            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to save pattern:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const setPreset = (weight: number) => {
        form.setValue('unfairnessWeight', weight)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Shift Pattern' : 'Add Shift Pattern'}
                    </DialogTitle>
                    <DialogDescription>
                        Define the properties for this shift type.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleActualSubmit)} className="space-y-6 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Pattern Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Early, Late, Night" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="requiredRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Required Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="STAFF">Staff Nurse</SelectItem>
                                                <SelectItem value="DEPUTY">Deputy / Senior</SelectItem>
                                                <SelectItem value="MANAGER">Manager / Lead</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="requiredStaff"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Staff Needed</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
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
                            name="unfairnessWeight"
                            render={({ field }) => (
                                <FormItem className="space-y-4 rounded-lg border p-4 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel className="flex items-center gap-2">
                                                Unfairness Weight
                                                <Info className="h-3 w-3 text-muted-foreground" />
                                            </FormLabel>
                                            <FormDescription>
                                                Higher weight = "harder" shift for staff
                                            </FormDescription>
                                        </div>
                                        <span className="text-2xl font-black text-primary">
                                            {field.value?.toFixed(1) || '1.0'}
                                        </span>
                                    </div>
                                    <FormControl>
                                        <Slider
                                            min={0.5}
                                            max={3.0}
                                            step={0.1}
                                            value={[field.value || 1.0]}
                                            onValueChange={(vals) => field.onChange(vals[0])}
                                            className="py-4"
                                        />
                                    </FormControl>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => setPreset(1.0)} className="text-[10px] h-7">NORMAL (1.0)</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setPreset(1.5)} className="text-[10px] h-7">WEEKEND (1.5)</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setPreset(2.5)} className="text-[10px] h-7">HOLIDAY (2.5)</Button>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="targetRating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Staff Rating (1-5)</FormLabel>
                                    <FormControl>
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[field.value || 3]}
                                            onValueChange={(vals) => field.onChange(vals[0])}
                                            className="py-4"
                                        />
                                    </FormControl>
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold px-1">
                                        <span>Junior</span>
                                        <span>Expert</span>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Color</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input type="color" className="p-1 w-12 h-10" {...field} />
                                            <Input placeholder="#3b82f6" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Demand Type */}
                        <FormField
                            control={form.control}
                            name="demandType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Staffing Demand Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select demand type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="FIXED">Fixed — always use Required Staff count</SelectItem>
                                            <SelectItem value="CENSUS">Census — calculate from live bed occupancy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Census mode uses the acuity-based nurse ratio engine to determine how many staff are needed.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="px-8">
                                {isLoading ? 'Saving...' : initialData ? 'Update Pattern' : 'Create Pattern'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
