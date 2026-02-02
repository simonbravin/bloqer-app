'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  Building2,
  User,
  Users,
  CreditCard,
  Bell,
  Shield,
} from 'lucide-react'

interface SettingsSidebarProps {
  role: string
}

export function SettingsSidebar({ role }: SettingsSidebarProps) {
  const t = useTranslations('settings')
  const pathname = usePathname()

  const sections = [
    {
      items: [
        {
          key: 'profile',
          href: '/settings/profile',
          icon: User,
          roles: ['VIEWER', 'ACCOUNTANT', 'EDITOR', 'ADMIN', 'OWNER'],
        },
        {
          key: 'organization',
          href: '/settings/organization',
          icon: Building2,
          roles: ['ADMIN', 'OWNER'],
        },
        {
          key: 'team',
          href: '/settings/team',
          icon: Users,
          roles: ['ADMIN', 'OWNER'],
        },
      ],
    },
    {
      label: t('preferences'),
      items: [
        {
          key: 'notifications',
          href: '/settings/notifications',
          icon: Bell,
          roles: ['VIEWER', 'ACCOUNTANT', 'EDITOR', 'ADMIN', 'OWNER'],
        },
      ],
    },
    {
      label: t('billing'),
      items: [
        {
          key: 'subscription',
          href: '/settings/subscription',
          icon: CreditCard,
          roles: ['OWNER'],
        },
        {
          key: 'security',
          href: '/settings/security',
          icon: Shield,
          roles: ['OWNER'],
        },
      ],
    },
  ]

  return (
    <nav className="w-64 shrink-0 border-r border-slate-200 bg-slate-50/50 p-6">
      <h2 className="mb-6 text-lg font-semibold text-slate-900">{t('settings')}</h2>
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index}>
            {section.label && (
              <p className="mb-2 text-xs font-medium uppercase text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items
                .filter((item) => item.roles.includes(role))
                .map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t(item.key)}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
