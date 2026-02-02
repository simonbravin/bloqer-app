'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format-utils'
import { calculateBudgetLine } from '@/lib/budget-calculations'
import { useTranslations } from 'next-intl'

export type BudgetLineRow = {
  id: string
  description: string
  unit: string
  quantity: { toNumber: () => number } | number
  directCostTotal: { toNumber: () => number } | number
  salePriceTotal?: { toNumber: () => number } | number
  overheadPct?: { toNumber: () => number } | number
  financialPct?: { toNumber: () => number } | number
  profitPct?: { toNumber: () => number } | number
  taxPct?: { toNumber: () => number } | number
  wbsNode: { id: string; code: string; name: string }
}

type BudgetLineTableProps = {
  lines: BudgetLineRow[]
  versionTotal: number
  canEdit: boolean
  canViewAdmin?: boolean
  onDelete: (lineId: string) => Promise<void>
}

function toNum(v: { toNumber: () => number } | number | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : v.toNumber()
}

function unitCost(line: BudgetLineRow): number {
  const qty = toNum(line.quantity)
  const total = toNum(line.directCostTotal)
  return qty > 0 ? total / qty : 0
}

function calculateLineBreakdown(line: BudgetLineRow) {
  const qty = toNum(line.quantity)
  const directTotal = toNum(line.directCostTotal)
  const unitDirect = qty > 0 ? directTotal / qty : 0
  const oh = toNum(line.overheadPct) || 0
  const fin = toNum(line.financialPct) || 0
  const prof = toNum(line.profitPct) || 0
  const tax = toNum(line.taxPct) ?? 21
  const calc = calculateBudgetLine(unitDirect, oh, fin, prof, tax)
  return {
    directCost: Number(calc.directCost) * qty,
    overheadAmount: Number(calc.overheadAmount) * qty,
    subtotal1: Number(calc.subtotal1) * qty,
    financialAmount: Number(calc.financialAmount) * qty,
    subtotal2: Number(calc.subtotal2) * qty,
    profitAmount: Number(calc.profitAmount) * qty,
    subtotal3: Number(calc.subtotal3) * qty,
    taxAmount: Number(calc.taxAmount) * qty,
    totalPrice: Number(calc.totalPrice) * qty,
  }
}

export function BudgetLineTable({
  lines,
  versionTotal,
  canEdit,
  canViewAdmin = false,
  onDelete,
}: BudgetLineTableProps) {
  const t = useTranslations('budget')
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('client')
  const showAdmin = canViewAdmin && viewMode === 'admin'

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {t('noBudgetLinesYet')}
      </div>
    )
  }

  const byWbs = new Map<string, BudgetLineRow[]>()
  for (const line of lines) {
    const key = line.wbsNode.id
    if (!byWbs.has(key)) byWbs.set(key, [])
    byWbs.get(key)!.push(line)
  }

  const wbsOrder = Array.from(byWbs.keys()).sort((a, b) => {
    const lineA = byWbs.get(a)![0]
    const lineB = byWbs.get(b)![0]
    return lineA.wbsNode.code.localeCompare(lineB.wbsNode.code)
  })

  const grandTotal = lines.reduce((sum, line) => {
    const b = calculateLineBreakdown(line)
    return sum + b.totalPrice
  }, 0)

  return (
    <div className="space-y-4">
      {canViewAdmin && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('viewModeTitle', { defaultValue: 'Modo de Visualización' })}:</span>
          <Button
            variant={viewMode === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('admin')}
          >
            {t('viewModeAdmin', { defaultValue: 'Modo Administrador' })}
          </Button>
          <Button
            variant={viewMode === 'client' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('client')}
          >
            {t('viewModeClient', { defaultValue: 'Modo Cliente' })}
          </Button>
        </div>
      )}
      {viewMode === 'client' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
          <strong>{t('clientViewNotice', { defaultValue: 'Vista para Cliente' })}</strong>
          <p className="mt-1 text-blue-800 dark:text-blue-200">
            {t('clientViewNoticeDesc', { defaultValue: 'Esta vista oculta los costos internos y márgenes. Solo muestra precios de venta.' })}
          </p>
        </div>
      )}
      <div className="rounded-lg border border-gray-200 overflow-x-auto dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('wbs')}</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('description')}</th>
            <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('quantity')}</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{t('unit')}</th>
            {showAdmin ? (
              <>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('directCost', { defaultValue: 'Costo Directo' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('overhead', { defaultValue: 'GG %' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('subtotal1', { defaultValue: 'Subtotal 1' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('financial', { defaultValue: 'GF %' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('subtotal2', { defaultValue: 'Subtotal 2' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('profit', { defaultValue: 'Benef %' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('subtotal3', { defaultValue: 'Subtotal 3' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('tax', { defaultValue: 'IVA %' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('total')}</th>
              </>
            ) : (
              <>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('unitPrice', { defaultValue: 'P. Unitario' })}</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">{t('total')}</th>
              </>
            )}
            {canEdit && <th className="w-20 px-3 py-2" />}
          </tr>
        </thead>
        <tbody>
          {wbsOrder.map((wbsId) => {
            const group = byWbs.get(wbsId)!
            const first = group[0]
            return (
              <tbody key={wbsId}>
                {group.map((line, idx) => (
                  <tr
                    key={line.id}
                    className={cn(
                      'border-b border-gray-100 dark:border-gray-800',
                      idx === 0 && 'bg-gray-50/50 dark:bg-gray-800/30'
                    )}
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                      {idx === 0 ? first.wbsNode.code : ''}
                    </td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{line.description}</td>
                    <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {typeof line.quantity === 'number'
                        ? line.quantity
                        : line.quantity.toNumber()}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{line.unit}</td>
                    {showAdmin ? (
                      (() => {
                        const b = calculateLineBreakdown(line)
                        return (
                          <>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.directCost)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.overheadAmount)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.subtotal1)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.financialAmount)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.subtotal2)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.profitAmount)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.subtotal3)}</td>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(b.taxAmount)}</td>
                            <td className="text-right tabular-nums font-medium text-gray-900 dark:text-white">{formatCurrency(b.totalPrice)}</td>
                          </>
                        )
                      })()
                    ) : (
                      (() => {
                        const b = calculateLineBreakdown(line)
                        const unitPrice = toNum(line.quantity) > 0 ? b.totalPrice / toNum(line.quantity) : 0
                        return (
                          <>
                            <td className="text-right tabular-nums text-gray-700 dark:text-gray-300">{formatCurrency(unitPrice)}</td>
                            <td className="text-right tabular-nums font-medium text-gray-900 dark:text-white">{formatCurrency(b.totalPrice)}</td>
                          </>
                        )
                      })()
                    )}
                    {canEdit && (
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => onDelete(line.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold dark:border-slate-600 dark:bg-slate-800">
            <td colSpan={showAdmin ? 12 : 5} className="px-3 py-2 text-right">
              {t('grandTotal', { defaultValue: 'TOTAL GENERAL' })}:
            </td>
            <td className="px-3 py-2 text-right text-lg tabular-nums text-gray-900 dark:text-white">
              {formatCurrency(grandTotal)}
            </td>
            {canEdit && <td />}
          </tr>
        </tfoot>
      </table>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 text-right font-medium tabular-nums text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white">
        {t('versionTotal')}: {formatCurrency(versionTotal)}
      </div>
    </div>
  )
}
