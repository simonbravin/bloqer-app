import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'

export default async function SettingsPage() {
  const locale = await getLocale()
  const session = await getSession()
  const orgContext = session?.user?.id
    ? await getOrgContext(session.user.id)
    : null

  // Redirect to organization if ADMIN/OWNER, otherwise to profile
  if (orgContext && ['ADMIN', 'OWNER'].includes(orgContext.role)) {
    redirect({ href: '/settings/organization', locale })
  }
  redirect({ href: '/settings/profile', locale })
}
