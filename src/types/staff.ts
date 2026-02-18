export interface StaffMember {
    id: string
    firstName: string
    lastName: string
    email: string
    contractHours: number
    role: 'MANAGER' | 'DEPUTY' | 'STAFF'
    skills: string[]
    rating?: number
    availability?: any[]
    createdAt: Date
}

export interface CreateStaffInput {
    firstName: string
    lastName: string
    email: string
    contractHours: number
    role: 'MANAGER' | 'DEPUTY' | 'STAFF'
    skills?: string[]
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> {
    id: string
}
