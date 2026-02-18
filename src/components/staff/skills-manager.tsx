'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Award, X } from 'lucide-react'
import { assignSkillToStaff, removeSkillFromStaff, updateStaffRating } from '@/app/actions/skills'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Skill {
    id: string
    name: string
}

interface SkillsManagerProps {
    staffId: string
    assignedSkills: string[] // Names or IDs, let's go with IDs for logic
    allSkills: Skill[]
    currentRating: number
}

export function SkillsManager({ staffId, assignedSkills, allSkills, currentRating }: SkillsManagerProps) {
    const [rating, setRating] = useState(currentRating)
    const [hoverRating, setHoverRating] = useState(0)

    async function handleToggleSkill(skill: Skill) {
        const isAssigned = assignedSkills.includes(skill.name)
        try {
            if (isAssigned) {
                // We'd need IDs here for precise removal, but skill names are unique in schema
                const skillObj = allSkills.find(s => s.name === skill.name)
                if (skillObj) await removeSkillFromStaff(staffId, skillObj.id)
            } else {
                await assignSkillToStaff(staffId, skill.id)
            }
            toast.success('Skills updated')
        } catch (error) {
            toast.error('Failed to update skills')
        }
    }

    async function handleRatingChange(newRating: number) {
        setRating(newRating)
        try {
            await updateStaffRating(staffId, newRating)
            toast.success('Rating updated')
        } catch (error) {
            toast.error('Failed to update rating')
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Performance Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="p-1 transition-transform active:scale-90"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => handleRatingChange(star)}
                        >
                            <Star
                                className={cn(
                                    "h-6 w-6 transition-colors",
                                    (hoverRating || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted border-2"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Clinical Skills</label>
                <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => {
                        const isAssigned = assignedSkills.includes(skill.name)
                        return (
                            <Badge
                                key={skill.id}
                                variant={isAssigned ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer px-3 py-1 text-xs transition-all",
                                    isAssigned
                                        ? "bg-primary hover:bg-primary/80"
                                        : "hover:bg-muted"
                                )}
                                onClick={() => handleToggleSkill(skill)}
                            >
                                {isAssigned && <Award className="mr-1 h-3 w-3" />}
                                {skill.name}
                            </Badge>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
