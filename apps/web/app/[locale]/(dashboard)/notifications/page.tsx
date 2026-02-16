import { getSession } from '@/lib/session'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationsList } from '@/components/notifications/notifications-list'

export default async function NotificationsPage() {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const t = await getTranslations('common')

  return (
    <div className="erp-view-container space-y-6 bg-background">
      <PageHeader
        title={t('notifications', { defaultValue: 'Notificaciones' })}
        subtitle={t('notificationsSubtitle', { defaultValue: 'Todas tus notificaciones con fecha y autor cuando aplique' })}
      />
      <NotificationsList />
    </div>
  )
}
