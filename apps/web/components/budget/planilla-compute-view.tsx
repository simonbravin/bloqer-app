'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useMessageBus } from '@/hooks/use-message-bus'
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
  const router = useRouter()

  useMessageBus('BUDGET_LINE.CREATED', () => router.refresh())
  useMessageBus('BUDGET_LINE.UPDATED', () => router.refresh())
  useMessageBus('BUDGET_LINE.DELETED', () => router.refresh())
  useMessageBus('BUDGET_RESOURCE.ADDED', () => router.refresh())
  useMessageBus('BUDGET_VERSION.APPROVED', () => router.refresh())
  useMessageBus('FINANCE_TRANSACTION.CREATED', () => router.refresh())

  const rows = computeSheetToRows(computeSheetLines)

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          {t('noLines', { defaultValue: 'No hay partidas en esta versión' })}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <HierarchicalComputeTable
        rows={rows}
        showVariance={false}
        showCostBars={false}
      />
    </div>
  )
}
