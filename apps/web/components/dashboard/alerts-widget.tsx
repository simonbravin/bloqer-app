'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react'
import type { Alert } from '@/app/actions/dashboard'

interface AlertsWidgetProps {
  alerts: Alert[]
}

/**
 * Alerts widget showing important notifications
 */
export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  const t = useTranslations('dashboard')

  const iconMap = {
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
  }

  const colorMap = {
    warning: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        {t('alertsTitle')}
      </h3>

      {alerts.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-green-50 p-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {t('noAlerts')}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {alerts.map((alert) => {
            const Icon = iconMap[alert.type]
            const colors = colorMap[alert.type]

            const content = (
              <div className="flex gap-3">
                <div className={`rounded-lg p-2 ${colors.bg}`}>
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {alert.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {alert.message}
                  </p>
                </div>
              </div>
            )

            if (alert.link) {
              return (
                <Link
                  key={alert.id}
                  href={alert.link}
                  className={`block rounded-lg border p-4 transition-colors hover:bg-slate-50 ${colors.border}`}
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${colors.border}`}
              >
                {content}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
