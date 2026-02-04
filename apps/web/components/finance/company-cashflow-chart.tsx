'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format-utils'
import type { CompanyCashflowPoint } from '@/app/actions/finance'

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

interface CompanyCashflowChartProps {
  initialData: CompanyCashflowPoint[]
}

export function CompanyCashflowChart({ initialData }: CompanyCashflowChartProps) {
  const chartData = useMemo(() => {
    return initialData.map((d) => {
      const [year, month] = d.month.split('-')
      const monthIndex = parseInt(month, 10) - 1
      const label = `${MONTH_NAMES[monthIndex]} ${year.slice(2)}`
      return {
        ...d,
        monthLabel: label,
      }
    })
  }, [initialData])

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay datos de cashflow para el período seleccionado
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="h-80 min-h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v: number) => formatCurrencyCompact(v, 'es-AR', 'ARS')}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, 'ARS')}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.monthLabel ?? ''}
            />
            <Legend wrapperStyle={{ paddingTop: '1rem' }} />
            <Line type="monotone" dataKey="income" name="Ingresos" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="expense" name="Gastos" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="overhead" name="Overhead" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="balance" name="Balance acumulado" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
