'use client'

import { cn } from '@/lib/utils'

const DATE_COLUMNS = ['startDate', 'plannedEndDate', 'issueDate', 'actualEndDate']

function formatShortDate(val: unknown): string {
  if (val == null) return ''
  const d = typeof val === 'string' ? new Date(val) : val instanceof Date ? val : null
  if (!d || Number.isNaN(d.getTime())) return String(val)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

type ReportPreviewProps = {
  data: Record<string, unknown>[]
  columns: { key: string; label: string }[]
  className?: string
}

export function ReportPreview({ data, columns, className }: ReportPreviewProps) {
  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-600">
        No data matching filters.
      </p>
    )
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              {columns.map((col) => {
                const val = row[col.key]
                const isAmount =
                  col.key === 'totalBudget' ||
                  col.key === 'gastadoHastaElMomento' ||
                  col.key === 'montoAvance' ||
                  col.key === 'diferencia'
                const isPct = col.key === 'avanceObraPct'
                const isDate = DATE_COLUMNS.includes(col.key)
                let display = ''
                if (val == null) display = ''
                else if (isDate) display = formatShortDate(val)
                else if (isPct && typeof val === 'number') display = `${val.toFixed(2)} %`
                else if (isAmount && typeof val === 'number')
                  display = new Intl.NumberFormat('es', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(val)
                else display = String(val)
                return (
                  <td
                    key={col.key}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400"
                  >
                    {display}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 50 && (
        <p className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700">
          Showing first 50 of {data.length} rows
        </p>
      )}
    </div>
  )
}
