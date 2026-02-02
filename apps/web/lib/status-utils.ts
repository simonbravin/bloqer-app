import type { StatusColor } from './design-tokens'

/**
 * Calculate variance status from budget data
 */
export function getVarianceStatus(
  actual: number,
  estimated: number,
  threshold: number = 0.05 // 5% threshold
): StatusColor {
  const variance = actual - estimated
  const variancePct = estimated > 0 ? variance / estimated : 0

  if (variancePct < -threshold) return 'success' // Under budget
  if (variancePct > threshold) return 'danger' // Over budget
  return 'neutral' // On track
}

/**
 * Get status color class for badges
 */
export function getStatusColorClass(status: StatusColor): string {
  const classMap: Record<StatusColor, string> = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
    info: 'badge-info',
  }

  return classMap[status]
}

/**
 * Get status text color for inline text
 */
export function getStatusTextColor(status: StatusColor): string {
  const classMap: Record<StatusColor, string> = {
    success: 'text-status-success',
    warning: 'text-status-warning',
    danger: 'text-status-danger',
    neutral: 'text-status-neutral',
    info: 'text-status-info',
  }

  return classMap[status]
}
