import { getStaff } from '@/app/actions/staff'
import { StaffClient } from './client'
import { StaffMember } from '@/types/staff'

export const metadata = {
    title: 'Staff Management - Rotaflow',
    description: 'Manage your ward staff',
}

export default async function StaffPage() {
    const staff = await getStaff() as unknown as StaffMember[]

    return <StaffClient initialStaff={staff} />
}
