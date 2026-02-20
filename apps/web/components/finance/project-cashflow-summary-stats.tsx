'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-utils'
import type { ProjectCashflowSummary } from '@/app/actions/finance'

interface Props {
  summary: ProjectCashflowSummary
  dateRange?: { from: Date; to: Date }
}

export function ProjectCashflowSummaryStats({ summary, dateRange }: Props) {
  const marginPct =
    summary.totalIncome === 0
      ? 0
      : (summary.periodBalance / summary.totalIncome) * 100

  const periodLabel = dateRange
    ? ` (${dateRange.from.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })} – ${dateRange.to.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })})`
    : ''

  const stats = [
    { label: 'Total Ingresos', value: formatCurrency(summary.totalIncome, 'ARS') },
    { label: 'Total Gastos', value: formatCurrency(summary.totalExpense, 'ARS') },
    {
      label: 'Balance Período',
      value: formatCurrency(summary.periodBalance, 'ARS'),
      valueClassName:
        summary.periodBalance >= 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Promedio Ingresos/Mes',
      value: formatCurrency(summary.avgMonthlyIncome, 'ARS'),
    },
    {
      label: 'Promedio Gastos/Mes',
      value: formatCurrency(summary.avgMonthlyExpense, 'ARS'),
    },
    { label: 'Margen del Período', value: `${marginPct.toFixed(1)}%` },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Período{periodLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
