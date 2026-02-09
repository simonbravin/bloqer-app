import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getOrgMembers, getPendingInvitations } from '@/app/actions/team'
import { TeamMembersClient } from '@/components/team/team-members-client'
import { PendingInvitationsClient } from '@/components/team/pending-invitations-client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTranslations } from 'next-intl/server'

export default async function TeamPage() {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) redirect({ href: '/login', locale })

  const [members, invitations] = await Promise.all([
    getOrgMembers(),
    getPendingInvitations(),
  ])

  const t = await getTranslations('nav')
  const canInvite = ['OWNER', 'ADMIN'].includes(orgContext.role)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('team')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona los miembros de tu organización
        </p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">
            Miembros ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitaciones Pendientes ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <TeamMembersClient
            initialMembers={members}
            canInvite={canInvite}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <PendingInvitationsClient initialInvitations={invitations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
