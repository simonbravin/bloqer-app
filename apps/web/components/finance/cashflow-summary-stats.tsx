'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-utils'

export type CashflowSummaryData = {
  totalIncome: number
  totalExpense: number
  totalOverhead: number
  totalProjectExpenses: number
  avgMonthlyIncome: number
  avgMonthlyExpense: number
  periodBalance: number
}

interface Props {
  summary: CashflowSummaryData
}

export function CashflowSummaryStats({ summary }: Props) {
  const overheadPct =
    summary.totalExpense === 0 ? 0 : (summary.totalOverhead / summary.totalExpense) * 100
  const marginPct =
    summary.totalIncome === 0
      ? 0
      : (summary.periodBalance / summary.totalIncome) * 100

  const stats = [
    { label: 'Total Ingresos', value: formatCurrency(summary.totalIncome, 'ARS') },
    { label: 'Total Gastos', value: formatCurrency(summary.totalExpense, 'ARS') },
    {
      label: 'Overhead',
      value: `${formatCurrency(summary.totalOverhead, 'ARS')} (${overheadPct.toFixed(1)}%)`,
    },
    {
      label: 'Balance Período',
      value: formatCurrency(summary.periodBalance, 'ARS'),
      valueClassName: summary.periodBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    },
    { label: 'Promedio Ingresos/Mes', value: formatCurrency(summary.avgMonthlyIncome, 'ARS') },
    { label: 'Promedio Gastos/Mes', value: formatCurrency(summary.avgMonthlyExpense, 'ARS') },
    { label: 'Gastos en Proyectos', value: formatCurrency(summary.totalProjectExpenses, 'ARS') },
    { label: 'Margen del Período', value: `${marginPct.toFixed(1)}%` },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <p className={`tabular-nums font-semibold ${s.valueClassName ?? ''}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
