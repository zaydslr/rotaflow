import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

import { prisma } from '@/lib/prisma'

export default async function Home() {
  const { user } = await validateRequest()

  if (!user) {
    redirect('/login')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const onLeaveCount = await prisma.availability.count({
    where: {
      staff: { workspaceId: user.workspaceId },
      startDate: { lte: today },
      endDate: { gte: today },
    }
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Welcome to Rotaflow</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Intelligent ward staffing scheduler
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>
              Add and manage your ward staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/staff">Manage Staff</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beds & Acuity</CardTitle>
            <CardDescription>
              Track bed occupancy and patient acuity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/beds">Manage Beds</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shift Scheduling</CardTitle>
            <CardDescription>
              Build and manage staff rotas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/rota">Rota Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Availability</CardTitle>
            <CardDescription>
              Track leave and attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground mb-2">
                {onLeaveCount === 0
                  ? 'All team members available'
                  : `${onLeaveCount} member${onLeaveCount === 1 ? '' : 's'} currently on leave`}
              </p>
              <Button asChild variant="outline">
                <Link href="/staff">View Absences</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinical Skills</CardTitle>
            <CardDescription>
              Manage staff certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/skills">Manage Skills</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
