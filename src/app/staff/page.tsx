import { getStaff } from '@/app/actions/staff'
import { StaffClient } from './client'

export const metadata = {
    title: 'Staff Management - Rotaflow',
    description: 'Manage your ward staff',
}

export default async function StaffPage() {
    const staff = await getStaff()

    return <StaffClient initialStaff={staff} />
}
