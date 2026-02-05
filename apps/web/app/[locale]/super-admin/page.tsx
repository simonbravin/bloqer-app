import { getSuperAdminDashboardStats } from '@/app/actions/super-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Shield, AlertTriangle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function SuperAdminDashboardPage() {
  const stats = await getSuperAdminDashboardStats()
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Super Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of organizations, users, and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.orgsTotal}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active (not blocked)</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.orgsActive}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.orgsBlocked}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.usersTotal}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent organizations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest registered organizations. Open Organizations for full list and actions.
          </p>
        </CardHeader>
        <CardContent>
          {stats.recentOrgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No organizations yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentOrgs.map((org) => (
                <li key={org.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{org.name}</span>
                    <Badge variant={org.isBlocked ? 'destructive' : 'secondary'}>
                      {org.subscriptionStatus}
                    </Badge>
                    {org.isBlocked && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        Blocked
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{org._count.members} users</span>
                    <span>{org._count.projects} projects</span>
                    <span>
                      {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true, locale: es })}
                    </span>
                    <Link
                      href={`/super-admin/organizations?org=${org.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
