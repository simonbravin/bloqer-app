import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getDownloadUrl } from '@/lib/r2-client'
import { prisma } from '@repo/database'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default async function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) {
    return redirect({ href: '/login', locale })
  }
  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md rounded-lg border border-status-danger/30 bg-destructive/10 p-6">
          <h1 className="text-lg font-semibold text-status-danger">
            No active organization
          </h1>
          <p className="mt-2 text-sm text-status-danger/90">
            Your account has no active organization. Please contact support or
            sign out and register again.
          </p>
          <a
            href="/api/auth/signout"
            className="mt-4 inline-block rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
          >
            Sign out
          </a>
        </div>
      </div>
    )
  }

  let orgLogoUrl: string | null = null
  const profile = await prisma.orgProfile.findUnique({
    where: { orgId: orgContext.orgId },
    select: { logoStorageKey: true },
  })
  if (profile?.logoStorageKey) {
    try {
      const url = await getDownloadUrl(profile.logoStorageKey)
      if (url.startsWith('http') || url.startsWith('/')) orgLogoUrl = url
    } catch {
      // R2 not configured or key invalid; sidebar will show org name
    }
  }

  return (
    <DashboardLayout
      orgName={orgContext.orgName}
      orgLogoUrl={orgLogoUrl}
      userName={session.user.name ?? session.user.email ?? 'User'}
    >
      {children}
    </DashboardLayout>
  )
}
