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
    <div className="border-b border-border bg-card">
      <nav className="flex flex-wrap gap-x-6 gap-y-2 px-6 py-1" aria-label="Tabs">
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
                'flex items-center gap-2 border-b-2 px-1 py-3.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/90 hover:border-border hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{tab.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
