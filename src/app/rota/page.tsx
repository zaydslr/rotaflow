import { startOfWeek } from 'date-fns'
import { getShiftsForWeek } from '@/app/actions/rota'
import { getPatterns } from '@/app/actions/patterns'
import { getStaff } from '@/app/actions/staff'
import { RotaClient } from './client'

export const metadata = {
    title: 'Rota Calendar - Rotaflow',
    description: 'Weekly staffing rota and assignments',
}

export default async function RotaPage() {
    const now = new Date()

    const [shifts, patterns, staff] = await Promise.all([
        getShiftsForWeek(now),
        getPatterns(),
        getStaff()
    ])

    return (
        <RotaClient
            initialShifts={shifts as any}
            patterns={patterns as any}
            staffList={staff as any}
        />
    )
}
