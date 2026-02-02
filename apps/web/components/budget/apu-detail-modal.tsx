'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatCurrency, formatNumber } from '@/lib/format-utils'
import { getAPUDetail } from '@/app/actions/budget'

type APUResource = {
  resourceCode: string
  resourceName: string
  resourceUnit: string
  quantityPerUnit: number
  unitCost: number
  subtotal: number
}

type APUData = {
  wbsCode: string
  wbsName: string
  unit: string
  resources: APUResource[]
  directCost: number
  indirectCostPct: number
  indirectCost: number
  totalUnitPrice: number
}

export function APUDetailModal({
  lineId,
  versionId,
  onClose,
}: {
  lineId: string
  versionId: string
  onClose: () => void
}) {
  const t = useTranslations('budget')
  const tCommon = useTranslations('common')
  const [apu, setApu] = useState<APUData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAPUDetail(lineId, versionId)
      .then((data) => {
        setApu(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lineId, versionId])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-8 dark:bg-gray-900">
          {tCommon('loading')}
        </div>
      </div>
    )
  }

  if (!apu) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('apuTitle')}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {apu.wbsCode} - {apu.wbsName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('unit')}: {apu.unit}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label={tCommon('close')}
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">
            {t('apuResources')}
          </h3>
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
              {apu.resources.map((r, idx) => (
                <tr key={idx} className="text-gray-900 dark:text-gray-100">
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
        </div>

        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('directCost')}:
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(apu.directCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('indirectCosts')} ({apu.indirectCostPct}%):
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(apu.indirectCost)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">{t('totalUnitPrice')}:</span>
                <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {formatCurrency(apu.totalUnitPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
