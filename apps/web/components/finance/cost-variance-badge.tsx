'use client'

import { cn } from '@/lib/utils'
import { VARIANCE_STATUS_BG, type VarianceStatus } from '@/lib/finance-utils'

type CostVarianceBadgeProps = {
  planned: number
  actual: number
  variance: number
  variancePct: number
  status: VarianceStatus
  className?: string
}

export function CostVarianceBadge({
  planned,
  actual,
  variance,
  variancePct,
  status,
  className,
}: CostVarianceBadgeProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium',
        VARIANCE_STATUS_BG[status],
        className
      )}
      title={`Planned: ${fmt(planned)} | Actual: ${fmt(actual)} | Variance: ${fmt(variance)} (${variancePct.toFixed(1)}%)`}
    >
      <span>{fmt(actual)}</span>
      <span>
        ({variancePct >= 0 ? '+' : ''}
        {variancePct.toFixed(1)}%)
      </span>
    </span>
  )
}
