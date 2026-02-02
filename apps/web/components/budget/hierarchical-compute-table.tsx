'use client'

import { useTranslations } from 'next-intl'
import { formatCurrency, formatNumber } from '@/lib/format-utils'
import { cn } from '@/lib/utils'
import { getVarianceStatus } from '@/lib/status-utils'
import { VarianceBadge } from '@/components/budget/variance-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WbsCostResult } from '@/app/actions/wbs'
import { spacing } from '@/lib/design-tokens'

export type WbsRow = {
  id: string
  code: string
  name: string
  category: string
  depth: number
  unit: string | null
  quantity: number | null
  unitPrice?: number
  total?: number
  costs?: WbsCostResult
  hasAPU?: boolean
}

type HierarchicalComputeTableProps = {
  rows: WbsRow[]
  showVariance?: boolean
  showCostBars?: boolean
  onApuClick?: (lineId: string) => void
  className?: string
}

function VarianceBar({
  estimated,
  actual,
}: {
  estimated: number
  actual: number
}) {
  if (estimated <= 0) return null
  const pct = Math.min(100, (actual / estimated) * 100)
  const status = getVarianceStatus(actual, estimated)
  const barColor =
    status === 'success'
      ? 'bg-status-success'
      : status === 'danger'
        ? 'bg-status-danger'
        : 'bg-status-neutral'
  return (
    <div className="flex h-2 w-full min-w-[80px] overflow-hidden rounded bg-muted">
      <div
        className={cn('h-full transition-all duration-300', barColor)}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

export function HierarchicalComputeTable({
  rows,
  showVariance = true,
  showCostBars = true,
  onApuClick,
  className,
}: HierarchicalComputeTableProps) {
  const t = useTranslations('budget')

  const grandTotal =
    rows.reduce((sum, r) => sum + (r.total ?? 0), 0) ||
    rows.reduce((sum, r) => sum + (r.costs?.estimatedTotal ?? 0), 0)

  return (
    <div
      className={cn(
        'erp-card overflow-auto',
        className
      )}
    >
      <div className="erp-card-header">
        <h3 className="text-lg font-semibold text-foreground">
          {t('computeSheet')}
        </h3>
      </div>
      <div className="erp-card-body overflow-auto p-0">
      <Table className="table-sticky-header w-full">
        <TableHeader>
          <TableRow className="border-b border-border bg-muted hover:bg-muted">
            <TableHead className="w-[140px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('wbs')}
            </TableHead>
            <TableHead className="min-w-[200px] font-semibold uppercase tracking-wide text-muted-foreground">
              Descripción
            </TableHead>
            <TableHead className="w-[80px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t('unit')}
            </TableHead>
            <TableHead className="w-[100px] text-right font-semibold uppercase tracking-wide text-muted-foreground">
              {t('quantity')}
            </TableHead>
            <TableHead className="w-[120px] text-right font-semibold uppercase tracking-wide text-muted-foreground">
              P.U.
            </TableHead>
            <TableHead className="w-[120px] text-right font-semibold uppercase tracking-wide text-muted-foreground">
              Subtotal
            </TableHead>
            {showVariance && (
              <TableHead className="w-[140px] font-semibold uppercase tracking-wide text-muted-foreground">
                Incidencia
              </TableHead>
            )}
            {showVariance && (
              <TableHead className="w-[100px] font-semibold uppercase tracking-wide text-muted-foreground">
                Varianza
              </TableHead>
            )}
            {onApuClick && (
              <TableHead className="w-[60px] text-center font-semibold uppercase tracking-wide text-muted-foreground">
                APU
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="group transition-colors"
            >
              <TableCell
                className="font-mono text-sm tabular-nums text-muted-foreground"
                style={{
                  paddingLeft:
                    row.depth === 0
                      ? '0.75rem'
                      : `calc(0.75rem + ${row.depth <= 3 ? spacing.indent[row.depth as 1 | 2 | 3] : '5rem'})`,
                }}
              >
                <span className="font-mono-numeric">{row.code}</span>
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {row.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.unit ?? '—'}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                {row.quantity != null ? formatNumber(row.quantity) : '—'}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                {row.unitPrice != null ? formatCurrency(row.unitPrice) : '—'}
              </TableCell>
              <TableCell className="text-right font-mono font-medium tabular-nums text-foreground">
                {row.total != null ? formatCurrency(row.total) : '—'}
              </TableCell>
                          {showVariance && (
                <TableCell className="w-[140px]">
                  {showCostBars && row.costs && row.costs.estimatedTotal > 0 ? (
                    <VarianceBar
                      estimated={row.costs.estimatedTotal}
                      actual={row.costs.actualTotal}
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}
              {showVariance && row.costs && row.costs.estimatedTotal > 0 && (
                <TableCell>
                  <VarianceBadge
                    actual={row.costs.actualTotal}
                    estimated={row.costs.estimatedTotal}
                    showAmount
                    showPercentage
                  />
                </TableCell>
              )}
              {showVariance && (!row.costs || row.costs.estimatedTotal <= 0) && (
                <TableCell className="text-muted-foreground">—</TableCell>
              )}
              {onApuClick && (
                <TableCell className="text-center">
                  {row.hasAPU ? (
                    <button
                      type="button"
                      onClick={() => onApuClick(row.id)}
                      className="rounded p-1 text-accent transition-colors hover:bg-accent/10 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                      title="Ver APU"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                    </button>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
        <tfoot className="border-t border-border bg-muted">
          <TableRow className="hover:bg-muted">
            <TableCell
              colSpan={5}
              className="px-3 py-3 text-right font-semibold text-muted-foreground"
            >
              {t('totalBudget')}:
            </TableCell>
            <TableCell className="px-3 py-3 text-right font-mono text-base font-semibold tabular-nums text-foreground">
              {formatCurrency(grandTotal)}
            </TableCell>
            {showVariance && <TableCell colSpan={2} />}
            {onApuClick && <TableCell />}
          </TableRow>
        </tfoot>
      </Table>
      </div>
    </div>
  )
}
