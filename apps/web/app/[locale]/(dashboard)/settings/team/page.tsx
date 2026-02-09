import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { prisma } from '@repo/database'
import { TeamMembersTable } from '@/components/settings/team-members-table'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { UserPlus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function TeamSettingsPage() {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const orgContext = await getOrgContext(session!.user!.id)
  if (!orgContext) redirect({ href: '/login', locale })

  const orgId = orgContext!.orgId
  const role = orgContext!.role

  if (!['ADMIN', 'OWNER'].includes(role)) {
    redirect({ href: '/settings/profile', locale })
  }

  const t = await getTranslations('settings')

  const members = await prisma.orgMember.findMany({
    where: { orgId },
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          lastLoginAt: true,
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t('teamMembers')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('teamMembersDesc')}
          </p>
        </div>

        {role === 'OWNER' && (
          <Button asChild>
            <Link href="/settings/team/invite">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('inviteMember')}
            </Link>
          </Button>
        )}
      </div>

      <TeamMembersTable
        members={members}
        currentUserId={session!.user!.id}
        canManage={role === 'OWNER'}
      />
    </div>
  )
}
