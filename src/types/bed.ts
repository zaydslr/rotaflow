export interface Procedure {
    id: string
    name: string
    defaultAcuity: 1 | 2 | 3 | 4 | 5
    defaultDuration: number
    color: string
}

export interface Bed {
    id: string
    name: string
    room?: string | null
    isIsolation: boolean
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
    currentAssignment?: BedAssignment | null
    createdAt: Date
}

export interface BedAssignment {
    id: string
    patientAcuity: 1 | 2 | 3 | 4 | 5
    startTime: Date
    endTime?: Date | null
    patientProcedure?: string | null
    procedureId?: string | null
    procedure?: Procedure | null
}

export interface CreateBedInput {
    name: string
    room?: string
    isIsolation?: boolean
    status?: 'AVAILABLE' | 'MAINTENANCE' | 'RESERVED'
}

export interface UpdateBedInput extends Partial<CreateBedInput> {
    id: string
}

export interface AssignPatientInput {
    patientAcuity: 1 | 2 | 3 | 4 | 5
    patientProcedure?: string
    procedureId?: string
    startTime: Date
}
