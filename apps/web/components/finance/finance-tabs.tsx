'use client'

import Link from 'next/link'
import { usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, List, TrendingUp, PieChart } from 'lucide-react'

const tabs = [
  { href: '/finance', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance/transactions', label: 'Transacciones', icon: List },
  { href: '/finance/cashflow', label: 'Cashflow', icon: TrendingUp },
  { href: '/finance/overhead', label: 'Overhead', icon: PieChart },
]

export function FinanceTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-1 dark:border-slate-800 dark:bg-slate-900/50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== '/finance' && pathname.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
