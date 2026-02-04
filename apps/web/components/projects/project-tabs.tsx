'use client'

import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BarChart3,
  Calculator,
  Calendar,
  DollarSign,
} from 'lucide-react'

interface ProjectTabsProps {
  projectId: string
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const tabs = [
    {
      name: t('overview'),
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: t('projectDashboard'),
      href: `/projects/${projectId}/dashboard`,
      icon: BarChart3,
    },
    {
      name: t('budget'),
      href: `/projects/${projectId}/budget`,
      icon: Calculator,
    },
    {
      name: t('schedule'),
      href: `/projects/${projectId}/schedule`,
      icon: Calendar,
    },
    {
      name: t('finance'),
      href: `/projects/${projectId}/finance`,
      icon: DollarSign,
    },
  ]

  return (
    <div className="border-b border-slate-200 bg-white">
      <nav className="flex space-x-8 px-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
