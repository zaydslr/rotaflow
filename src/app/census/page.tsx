import { getCurrentCensus, getCensusTrend } from '@/app/actions/census'
import { CensusDashboardClient } from './client'

export const metadata = {
    title: 'Census Dashboard — Rotaflow',
    description: 'Live patient census, acuity breakdown, and required nurse calculations',
}

export default async function CensusPage() {
    const [snapshot, trend] = await Promise.all([
        getCurrentCensus(),
        getCensusTrend(14),
    ])

    return <CensusDashboardClient snapshot={snapshot} trend={trend} />
}
