'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatCurrency, formatNumber } from '@/lib/format-utils'
import { APUDetailModal } from './apu-detail-modal'

export type ComputeSheetLine = {
  id: string
  wbsCode: string
  wbsName: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  hasAPU: boolean
}

type ComputeSheetViewProps = {
  lines: ComputeSheetLine[]
  versionId: string
}

export function ComputeSheetView({ lines, versionId }: ComputeSheetViewProps) {
  const t = useTranslations('budget')
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)

  const grandTotal = lines.reduce((sum, line) => sum + line.total, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <tr>
            <th className="px-4 py-3 text-left">Código</th>
            <th className="px-4 py-3 text-left">Descripción</th>
            <th className="px-4 py-3 text-left">{t('unit')}</th>
            <th className="px-4 py-3 text-right">{t('quantity')}</th>
            <th className="px-4 py-3 text-right">P.U.</th>
            <th className="px-4 py-3 text-right">Subtotal</th>
            <th className="px-4 py-3 text-center">APU</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {lines.map((line) => (
            <tr
              key={line.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                {line.wbsCode}
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-white">
                {line.wbsName}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {line.unit}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                {formatNumber(line.quantity)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                {formatCurrency(line.unitPrice)}
              </td>
              <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900 dark:text-white">
                {formatCurrency(line.total)}
              </td>
              <td className="px-4 py-3 text-center">
                {line.hasAPU && (
                  <button
                    type="button"
                    onClick={() => setSelectedLineId(line.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Ver análisis de precio unitario"
                  >
                    📊
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold dark:bg-gray-800">
          <tr>
            <td colSpan={5} className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
              {t('totalBudget')}:
            </td>
            <td className="px-4 py-3 text-right text-lg tabular-nums text-gray-900 dark:text-white">
              {formatCurrency(grandTotal)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {selectedLineId && (
        <APUDetailModal
          lineId={selectedLineId}
          versionId={versionId}
          onClose={() => setSelectedLineId(null)}
        />
      )}
    </div>
  )
}
