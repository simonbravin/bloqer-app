import { Badge } from '@/components/ui/badge'
import { getVarianceStatus } from '@/lib/status-utils'
import { formatCurrency, formatPercentage } from '@/lib/format-utils'

interface VarianceBadgeProps {
  actual: number
  estimated: number
  showAmount?: boolean
  showPercentage?: boolean
  threshold?: number
}

export function VarianceBadge({
  actual,
  estimated,
  showAmount = true,
  showPercentage = true,
  threshold,
}: VarianceBadgeProps) {
  const variance = actual - estimated
  const variancePct = estimated > 0 ? (variance / estimated) * 100 : 0

  const status = getVarianceStatus(actual, estimated, threshold)

  let label = ''
  if (showAmount && showPercentage) {
    label = `${formatCurrency(variance)} (${formatPercentage(variancePct)})`
  } else if (showAmount) {
    label = formatCurrency(variance)
  } else if (showPercentage) {
    label = formatPercentage(variancePct)
  }

  return (
    <Badge variant={status}>
      {variance < 0 ? '↓ ' : variance > 0 ? '↑ ' : ''}
      {label}
    </Badge>
  )
}
