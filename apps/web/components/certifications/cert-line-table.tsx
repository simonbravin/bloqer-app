'use client'

import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/certification-utils'

export type CertLineRow = {
  id: string
  wbsNode: { code: string; name: string } | null
  budgetLine?: { description: string } | null
  prevProgressPct: number
  periodProgressPct: number
  totalProgressPct: number
  contractualQtySnapshot: number
  unitPriceSnapshot: number
  prevQty: number
  periodQty: number
  totalQty: number
  remainingQty: number
  prevAmount: number
  periodAmount: number
  totalAmount: number
}

type CertLineTableProps = {
  lines: CertLineRow[]
  canDelete: boolean
  onDelete?: (lineId: string) => Promise<void>
}

export function CertLineTable({
  lines,
  canDelete,
  onDelete,
}: CertLineTableProps) {
  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        No lines yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">WBS</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Description</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Prev %</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Period %</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Total %</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Period Qty</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Period Amount</th>
            {canDelete && <th className="w-16 px-3 py-2" />}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                {line.wbsNode?.code ?? '—'}
              </td>
              <td className="px-3 py-2 text-gray-900 dark:text-white">
                {line.budgetLine?.description ?? line.wbsNode?.name ?? '—'}
              </td>
              <td className="text-right tabular-nums text-gray-600 dark:text-gray-400">
                {line.prevProgressPct.toFixed(2)}%
              </td>
              <td className="text-right tabular-nums text-gray-600 dark:text-gray-400">
                {line.periodProgressPct.toFixed(2)}%
              </td>
              <td className="text-right tabular-nums font-medium text-gray-900 dark:text-white">
                {line.totalProgressPct.toFixed(2)}%
              </td>
              <td className="text-right tabular-nums text-gray-600 dark:text-gray-400">
                {line.periodQty.toFixed(4)}
              </td>
              <td className="text-right tabular-nums font-medium text-gray-900 dark:text-white">
                {formatCurrency(line.periodAmount)}
              </td>
              {canDelete && onDelete && (
                <td className="px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    onClick={async () => {
                      if (confirm('Remove this line?')) {
                        await onDelete(line.id)
                      }
                    }}
                  >
                    Remove
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
