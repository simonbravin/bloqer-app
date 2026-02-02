'use client'

import { cn } from '@/lib/utils'

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
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400"
                >
                  {String(row[col.key] ?? '')}
                </td>
              ))}
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
