'use client'

import { useTranslations } from 'next-intl'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format-utils'
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
import type { CashflowDataPoint } from '@/app/actions/dashboard'

interface CashflowChartProps {
  data: CashflowDataPoint[]
}

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

/**
 * Cashflow chart showing income, expenses, and net over time
 */
export function CashflowChart({ data }: CashflowChartProps) {
  const t = useTranslations('dashboard')

  // Format month labels for display
  const formattedData = data.map((item) => {
    const [year, month] = item.month.split('-')
    const monthIndex = parseInt(month, 10) - 1
    const monthLabel = `${MONTH_NAMES[monthIndex]} ${year.slice(2)}`

    return {
      ...item,
      monthLabel,
    }
  })

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="mb-2 font-medium text-slate-900">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        {t('cashflowTitle')}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {t('cashflowSubtitle')}
      </p>

      <div className="mt-6 h-80">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value: number) => formatCurrencyCompact(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '1rem' }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name={t('income')}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name={t('expenses')}
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="net"
                name={t('net')}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">{t('noDataAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
