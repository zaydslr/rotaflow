'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Award, Search } from 'lucide-react'
import { createSkill, deleteSkill } from '@/app/actions/skills'
import { toast } from 'sonner'

interface Skill {
    id: string
    name: string
}

interface SkillsClientProps {
    initialSkills: Skill[]
}

export function SkillsClient({ initialSkills }: SkillsClientProps) {
    const [skills, setSkills] = useState(initialSkills)
    const [newSkillName, setNewSkillName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function handleAddSkill(e: React.FormEvent) {
        e.preventDefault()
        if (!newSkillName.trim()) return

        setIsLoading(true)
        try {
            const skill = await createSkill(newSkillName)
            setSkills(prev => [...prev, skill].sort((a, b) => a.name.localeCompare(b.name)))
            setNewSkillName('')
            toast.success('Skill added successfully')
        } catch (error) {
            toast.error('Failed to add skill')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDeleteSkill(id: string) {
        if (!confirm('Are you sure? Removing this skill will delete it from all staff members.')) return
        try {
            await deleteSkill(id)
            setSkills(prev => prev.filter(s => s.id !== id))
            toast.success('Skill deleted')
        } catch (error) {
            toast.error('Failed to delete skill')
        }
    }

    const filteredSkills = skills.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Clinical Skills & Certifications</h1>
                <p className="text-muted-foreground">Define specialized skills that can be assigned to ward staff</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Add New Skill</CardTitle>
                        <CardDescription>Create a skill to track in your workforce</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddSkill} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="e.g. IV Certified, Mentor, ALS"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading || !newSkillName.trim()}>
                                <Plus className="mr-2 h-4 w-4" /> Add Skill
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Catalog ({skills.length})</CardTitle>
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search skills..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {filteredSkills.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-8 w-full text-center">
                                    No skills match your search.
                                </p>
                            ) : (
                                filteredSkills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-muted/50 border rounded-full group hover:bg-muted transition-colors"
                                    >
                                        <Award className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">{skill.name}</span>
                                        <button
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
