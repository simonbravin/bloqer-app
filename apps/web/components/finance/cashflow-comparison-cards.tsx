'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-utils'
import { TrendingUp, TrendingDown, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

export type CashflowComparisonData = {
  current: { income: number; expense: number; balance: number }
  previous: { income: number; expense: number; balance: number }
  changes: { incomeChange: number; expenseChange: number; balanceChange: number }
}

interface Props {
  data: CashflowComparisonData
}

export function CashflowComparisonCards({ data }: Props) {
  const cards = [
    {
      title: 'Ingresos del Mes',
      current: data.current.income,
      change: data.changes.incomeChange,
      icon: ArrowUpIcon,
      positive: data.changes.incomeChange >= 0,
    },
    {
      title: 'Gastos del Mes',
      current: data.current.expense,
      change: data.changes.expenseChange,
      icon: ArrowDownIcon,
      positive: data.changes.expenseChange <= 0,
    },
    {
      title: 'Balance del Mes',
      current: data.current.balance,
      change: data.changes.balanceChange,
      icon: data.current.balance >= 0 ? TrendingUp : TrendingDown,
      positive: data.changes.balanceChange >= 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatCurrency(card.current, 'ARS')}
            </div>
            <p
              className={`mt-1 flex items-center gap-1 text-xs ${
                card.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {card.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(card.change).toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
