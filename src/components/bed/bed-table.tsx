'use client'

import { Bed } from '@/types/bed'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, UserPlus, LogOut, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BedTableProps {
    beds: Bed[]
    onEdit: (bed: Bed) => void
    onDelete: (id: string) => void
    onAssign: (bed: Bed) => void
    onDischarge: (assignmentId: string) => void
}

export function BedTable({ beds, onEdit, onDelete, onAssign, onDischarge }: BedTableProps) {
    const getStatusColor = (status: Bed['status'], acuity?: number) => {
        if (status === 'AVAILABLE') return 'bg-green-100 text-green-800 border-green-200'
        if (status === 'OCCUPIED') {
            if (acuity === 4 || acuity === 5) return 'bg-red-100 text-red-800 border-red-200'
            if (acuity === 3) return 'bg-orange-100 text-orange-800 border-orange-200'
            return 'bg-blue-100 text-blue-800 border-blue-200'
        }
        if (status === 'MAINTENANCE') return 'bg-gray-100 text-gray-800 border-gray-200'
        if (status === 'RESERVED') return 'bg-purple-100 text-purple-800 border-purple-200'
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {beds.length === 0 ? (
                <Card className="col-span-full py-12 text-center text-muted-foreground">
                    No beds configured. Add your first bed to start managing patient flow.
                </Card>
            ) : (
                beds.map((bed) => (
                    <Card key={bed.id} className={cn("overflow-hidden border-2",
                        bed.isIsolation ? "border-amber-400" : "border-transparent"
                    )}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold">{bed.name}</CardTitle>
                                    <CardDescription>{bed.room || 'No Room'}</CardDescription>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <Badge variant="outline" className={getStatusColor(bed.status, bed.currentAssignment?.patientAcuity)}>
                                        {bed.status}
                                    </Badge>
                                    {bed.isIsolation && (
                                        <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200 flex gap-1">
                                            <ShieldAlert className="h-3 w-3" /> Isolation
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-3 min-h-[100px]">
                            {bed.currentAssignment ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold">Acuity:</span>
                                        <Badge className={cn(
                                            bed.currentAssignment.patientAcuity >= 4 ? "bg-red-600" :
                                                bed.currentAssignment.patientAcuity === 3 ? "bg-orange-500" : "bg-blue-600"
                                        )}>
                                            Level {bed.currentAssignment.patientAcuity}
                                        </Badge>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-semibold block">Procedure:</span>
                                        <span className="text-muted-foreground">
                                            {bed.currentAssignment.patientProcedure || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Since {new Date(bed.currentAssignment.startTime).toLocaleString()}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                                    Ready for admission
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-muted/30 pt-3">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(bed)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(bed.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                {bed.currentAssignment ? (
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDischarge(bed.currentAssignment!.id)}>
                                        <LogOut className="mr-2 h-4 w-4" /> Discharge
                                    </Button>
                                ) : (
                                    <Button size="sm" disabled={bed.status !== 'AVAILABLE'} onClick={() => onAssign(bed)}>
                                        <UserPlus className="mr-2 h-4 w-4" /> Assign
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))
            )}
        </div>
    )
}
