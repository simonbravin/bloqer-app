'use client'

import Link from 'next/link'
import { usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  List,
  TrendingUp,
  PieChart,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
} from 'lucide-react'

/** Barra de pestañas: Dashboard primero, luego Transacciones, Generales, resto. Ocupa todo el ancho. */
const TABS = [
  { href: '/finance', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/finance/transactions', label: 'Transacciones', icon: List, exact: false },
  { href: '/finance/overhead', label: 'Generales', icon: PieChart, exact: false },
  { href: '/finance/accounts-payable', label: 'Cuentas por pagar', icon: ArrowDownCircle, exact: false },
  { href: '/finance/accounts-receivable', label: 'Cuentas por cobrar', icon: ArrowUpCircle, exact: false },
  { href: '/finance/cashflow', label: 'Flujo de caja', icon: TrendingUp, exact: false },
  { href: '/finance/cash-projection', label: 'Proyección de caja', icon: Calendar, exact: false },
] as const

export function FinanceTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex w-full flex-nowrap gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
      {TABS.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
