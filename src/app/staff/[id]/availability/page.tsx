import { getStaffById } from '@/app/actions/staff'
import { getStaffAvailability } from '@/app/actions/availability'
import { AvailabilityClient } from './client'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'Staff Availability - Rotaflow',
}

interface PageProps {
    params: { id: string }
}

export default async function StaffAvailabilityPage({ params }: PageProps) {
    const staff = await getStaffById(params.id)
    if (!staff) notFound()

    const availability = await getStaffAvailability(params.id)

    return (
        <AvailabilityClient
            staff={staff as any}
            initialAvailability={availability as any}
        />
    )
}
