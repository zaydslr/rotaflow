import { validateRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function Home() {
  const { user } = await validateRequest()

  if (!user) {
    redirect('/login')
  }

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
            <Button variant="outline" disabled>
              Coming Soon
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
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
