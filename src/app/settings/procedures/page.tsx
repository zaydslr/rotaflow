import { getProcedures } from '@/app/actions/procedures'
import { ProcedureLibraryClient } from './client'

export const metadata = {
    title: 'Procedure Library — Rotaflow Settings',
    description: 'Manage clinical procedures for bed assignment',
}

export default async function ProceduresSettingsPage() {
    const procedures = await getProcedures()
    return <ProcedureLibraryClient initialProcedures={procedures as any} />
}
