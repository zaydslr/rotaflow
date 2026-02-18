import { getSkills } from '@/app/actions/skills'
import { SkillsClient } from './client'

export const metadata = {
    title: 'Clinical Skills - Rotaflow',
}

export default async function SkillsPage() {
    const skills = await getSkills()

    return <SkillsClient initialSkills={skills as any} />
}
