import { getPatterns } from '@/app/actions/patterns'
import { PatternsClient } from './client'

export const metadata = {
    title: 'Shift Patterns - Rotaflow',
    description: 'Customize your ward shift types',
}

export default async function PatternsPage() {
    const patterns = await getPatterns()

    return <PatternsClient initialPatterns={patterns as any} />
}
