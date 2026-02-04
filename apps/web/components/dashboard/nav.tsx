'use client'

import { useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  IconDashboard,
  IconProjects,
  IconFinance,
  IconResources,
  IconReports,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from '@/components/ui/icons'

const navItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', Icon: IconDashboard },
  { href: '/projects', labelKey: 'nav.projects', Icon: IconProjects },
  { href: '/finance', labelKey: 'nav.finance', Icon: IconFinance },
  { href: '/resources', labelKey: 'nav.resources', Icon: IconResources },
  { href: '/reports', labelKey: 'nav.reports', Icon: IconReports },
  { href: '/settings', labelKey: 'nav.settings', Icon: IconSettings },
]

export function Nav() {
  const pathname = usePathname()
  const t = useTranslations()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r transition-[width] duration-200 ease-in-out',
        'bg-navy border-navy-light',
        collapsed ? 'w-[56px]' : 'w-[220px] md:w-[240px]'
      )}
      aria-label="Main navigation"
    >
      <div
        className={cn(
          'flex h-12 items-center border-b border-navy-light px-2',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed && (
          <span className="truncate px-2 text-sm font-semibold text-primary-foreground">
            ERP
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md',
            'text-primary-foreground/70 transition-colors',
            'hover:bg-navy-light hover:text-primary-foreground',
            'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-navy',
            'active:bg-navy-light'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <IconChevronRight size="sm" />
          ) : (
            <IconChevronLeft size="sm" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.Icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-navy',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-primary-foreground/70 hover:bg-navy-light hover:text-primary-foreground active:bg-navy-light',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <Icon size="md" className="shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{t(item.labelKey)}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
