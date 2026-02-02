import { Prisma } from '@repo/database'

export type VarianceStatus = 'UNDER' | 'ON_TRACK' | 'OVER'

export interface VarianceResult {
  variance: Prisma.Decimal
  variancePct: Prisma.Decimal
  status: VarianceStatus
}

/**
 * Calculate cost variance between planned and actual.
 * - UNDER: actual < 90% of planned (under budget)
 * - ON_TRACK: 90–110% of planned
 * - OVER: > 110% of planned (over budget)
 */
export function calculateVariance(
  planned: Prisma.Decimal | number,
  actual: Prisma.Decimal | number
): VarianceResult {
  const p = typeof planned === 'number' ? new Prisma.Decimal(planned) : planned
  const a = typeof actual === 'number' ? new Prisma.Decimal(actual) : actual
  const variance = a.sub(p)
  const variancePct = p.isZero()
    ? new Prisma.Decimal(0)
    : variance.div(p).mul(100)

  let status: VarianceStatus
  if (variancePct.lessThan(-10)) status = 'UNDER'
  else if (variancePct.greaterThan(10)) status = 'OVER'
  else status = 'ON_TRACK'

  return { variance, variancePct, status }
}

export const VARIANCE_STATUS_COLOR: Record<VarianceStatus, string> = {
  UNDER: 'text-emerald-600 dark:text-emerald-400',
  ON_TRACK: 'text-amber-600 dark:text-amber-400',
  OVER: 'text-red-600 dark:text-red-400',
}

export const VARIANCE_STATUS_BG: Record<VarianceStatus, string> = {
  UNDER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  ON_TRACK: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  OVER: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}
