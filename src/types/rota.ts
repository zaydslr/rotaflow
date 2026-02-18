export type ShiftStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export type DemandType = 'FIXED' | 'CENSUS'

export interface ShiftPattern {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
    requiredStaff: number;
    isDefault: boolean;
    unfairnessWeight: number;
    targetRating: number;
    requiredRole: 'MANAGER' | 'DEPUTY' | 'STAFF';
    createdAt: Date;
    updatedAt: Date;
}

export interface Shift {
    id: string;
    date: Date;
    patternId: string;
    pattern: ShiftPattern;
    startTime: Date;
    endTime: Date;
    staffId?: string | null;
    staff?: any;
    status: ShiftStatus;
    unfairnessWeight: number;
    targetRating: number;
    requiredRole: 'MANAGER' | 'DEPUTY' | 'STAFF';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateShiftPatternInput {
    name: string;
    startTime: string;
    endTime: string;
    color: string;
    requiredStaff?: number;
    unfairnessWeight?: number;
    targetRating?: number;
    requiredRole?: 'MANAGER' | 'DEPUTY' | 'STAFF';
}

export interface UpdateShiftPatternInput extends Partial<CreateShiftPatternInput> {
    id: string;
}
