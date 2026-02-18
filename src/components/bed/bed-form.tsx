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
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Bed, CreateBedInput } from '@/types/bed'

const bedSchema = z.object({
    name: z.string().min(1, 'Bed name is required'),
    room: z.string().optional(),
    isIsolation: z.boolean(),
    status: z.enum(['AVAILABLE', 'MAINTENANCE', 'RESERVED']),
})

type BedFormValues = z.infer<typeof bedSchema>

interface BedFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateBedInput) => Promise<void>
    initialData?: Bed | null
}

export function BedForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: BedFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<BedFormValues>({
        resolver: zodResolver(bedSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            room: initialData.room || '',
            isIsolation: initialData.isIsolation,
            status: initialData.status === 'OCCUPIED' ? 'AVAILABLE' : initialData.status as any,
        } : {
            name: '',
            room: '',
            isIsolation: false,
            status: 'AVAILABLE',
        },
    })

    async function handleSubmit(values: BedFormValues) {
        setIsLoading(true)
        try {
            await onSubmit(values as CreateBedInput)
            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to save bed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Edit Bed' : 'Add New Bed'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bed Name / ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bed 101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="room"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room / Bay</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bay A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isIsolation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Isolation Room
                                        </FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Mark if this is a side room or isolation ward.
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Available</SelectItem>
                                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                            <SelectItem value="RESERVED">Reserved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
