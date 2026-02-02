'use client'

import { useTranslations } from 'next-intl'
import { formatCurrency, formatNumber } from '@/lib/format-utils'

export type ResourceBreakdownRow = {
  resourceCode: string
  resourceName: string
  resourceUnit: string
  quantityPerUnit: number
  unitCost: number
  subtotal: number
}

type ResourceBreakdownTableProps = {
  resources: ResourceBreakdownRow[]
}

/**
 * Displays the resource breakdown (APU) for a budget line.
 * Used within the APU detail modal or inline.
 */
export function ResourceBreakdownTable({ resources }: ResourceBreakdownTableProps) {
  const t = useTranslations('budget')

  if (resources.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Sin recursos definidos para esta partida.
      </p>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 text-xs uppercase dark:bg-gray-800">
        <tr>
          <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">
            Código
          </th>
          <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">
            Descripción
          </th>
          <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400">
            {t('unit')}
          </th>
          <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
            {t('quantity')}
          </th>
          <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
            P.U.
          </th>
          <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
            Subtotal
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {resources.map((r, idx) => (
          <tr key={idx}>
            <td className="px-3 py-2 font-mono text-xs">{r.resourceCode}</td>
            <td className="px-3 py-2">{r.resourceName}</td>
            <td className="px-3 py-2">{r.resourceUnit}</td>
            <td className="px-3 py-2 text-right tabular-nums">
              {formatNumber(r.quantityPerUnit)}
            </td>
            <td className="px-3 py-2 text-right tabular-nums">
              {formatCurrency(r.unitCost)}
            </td>
            <td className="px-3 py-2 text-right font-medium tabular-nums">
              {formatCurrency(r.subtotal)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
