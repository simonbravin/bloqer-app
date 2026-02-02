import { getSession } from '@/lib/session'
import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { PageHeader } from '@/components/layout/page-header'
import { getTranslations } from 'next-intl/server'

export default async function NotificationsSettingsPage() {
  const session = await getSession()
  const locale = await getLocale()
  if (!session?.user?.id) redirect({ href: '/login', locale })

  const t = await getTranslations('settings')

  return (
    <div className="h-full">
      <PageHeader
        title={t('notifications')}
        subtitle={t('notificationsSubtitle', {
          defaultValue: 'Configura tus preferencias de notificaciones',
        })}
      />
      <div className="p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">
            {t('comingSoon', { defaultValue: 'Próximamente' })}
          </p>
        </div>
      </div>
    </div>
  )
}
