import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { InviteMemberForm } from '@/components/settings/invite-member-form'
import { getTranslations } from 'next-intl/server'

export default async function InviteMemberPage() {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const orgContext = await getOrgContext(session!.user!.id)
  if (!orgContext) redirect({ href: '/login', locale })

  if (orgContext!.role !== 'OWNER') {
    redirect({ href: '/settings/team', locale })
  }

  const t = await getTranslations('settings')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {t('inviteMember')}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('inviteMemberDesc')}
        </p>
      </div>

      <InviteMemberForm />
    </div>
  )
}
