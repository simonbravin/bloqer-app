'use client'

import { useTranslations } from 'next-intl'
import { HierarchicalComputeTable, type WbsRow } from './hierarchical-compute-table'

type ComputeSheetLine = {
  id: string
  wbsCode: string
  wbsName: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  hasAPU: boolean
}

type PlanillaComputeViewProps = {
  computeSheetLines: ComputeSheetLine[]
}

function computeSheetToRows(lines: ComputeSheetLine[]): WbsRow[] {
  return lines.map((line) => {
    const parts = line.wbsCode.split('.')
    const depth = Math.max(0, parts.length - 1)
    return {
      id: line.id,
      code: line.wbsCode,
      name: line.wbsName,
      category: '',
      depth,
      unit: line.unit,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      total: line.total,
      hasAPU: line.hasAPU,
    }
  })
}

/**
 * Standalone planilla de cómputo view (compute sheet)
 */
export function PlanillaComputeView({ computeSheetLines }: PlanillaComputeViewProps) {
  const t = useTranslations('budget')
  const rows = computeSheetToRows(computeSheetLines)

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-500">
          {t('noLines', { defaultValue: 'No hay partidas en esta versión' })}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <HierarchicalComputeTable
        rows={rows}
        showVariance={false}
        showCostBars={false}
      />
    </div>
  )
}
