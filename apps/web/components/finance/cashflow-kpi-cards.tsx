'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatCurrencyForDisplay } from '@/lib/format-utils'
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, AlertCircleIcon } from 'lucide-react'

export interface CashflowKPIs {
  totalIncome: number
  totalExpense: number
  balance: number
  pendingIncome: number
  pendingExpense: number
  currentMonthIncome: number
  currentMonthExpense: number
  currentMonthNet: number
}

interface Props {
  kpis: CashflowKPIs
}

export function CashflowKPICards({ kpis }: Props) {
  const cards = [
    {
      title: 'Total Ingresos',
      value: kpis.totalIncome,
      icon: ArrowUpIcon,
      variant: 'success' as const,
      description: `Pendientes: ${formatCurrency(kpis.pendingIncome)}`,
    },
    {
      title: 'Total Gastos',
      value: kpis.totalExpense,
      icon: ArrowDownIcon,
      variant: 'destructive' as const,
      description: `Pendientes: ${formatCurrency(kpis.pendingExpense)}`,
    },
    {
      title: 'Balance Total',
      value: kpis.balance,
      icon: TrendingUpIcon,
      variant: (kpis.balance >= 0 ? 'success' : 'destructive') as 'success' | 'destructive',
      description: 'Ingresos - Gastos',
    },
    {
      title: 'Flujo del Mes',
      value: kpis.currentMonthNet,
      icon: AlertCircleIcon,
      variant: (kpis.currentMonthNet >= 0 ? 'success' : 'warning') as 'success' | 'warning',
      description: `Ingresos: ${formatCurrency(kpis.currentMonthIncome)} | Gastos: ${formatCurrency(kpis.currentMonthExpense)}`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon
              className={`h-4 w-4 ${
                card.variant === 'success'
                  ? 'text-green-600 dark:text-green-500'
                  : card.variant === 'destructive'
                    ? 'text-red-600 dark:text-red-500'
                    : 'text-yellow-600 dark:text-yellow-500'
              }`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold tabular-nums erp-kpi-value min-w-0 ${
                card.variant === 'success'
                  ? 'text-green-600 dark:text-green-500'
                  : card.variant === 'destructive'
                    ? 'text-red-600 dark:text-red-500'
                    : ''
              }`}
            >
              {formatCurrencyForDisplay(card.value)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
