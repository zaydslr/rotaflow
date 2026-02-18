import { getBeds } from '@/app/actions/bed'
import { BedClient } from './client'
import { Bed } from '@/types/bed'

export const metadata = {
    title: 'Bed Management - Rotaflow',
    description: 'Manage ward beds and patient acuity',
}

export default async function BedPage() {
    const beds = await getBeds() as unknown as Bed[]

    return <BedClient initialBeds={beds} />
}
