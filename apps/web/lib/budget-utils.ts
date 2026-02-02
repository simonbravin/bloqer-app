import { Prisma } from '@repo/database'

/**
 * Calculate line total from quantity * unitCost.
 * Used when creating/updating budget lines (store as directCostTotal).
 */
export function calculateLineTotal(
  quantity: number | Prisma.Decimal,
  unitCost: number | Prisma.Decimal
): Prisma.Decimal {
  const q = typeof quantity === 'number' ? quantity : Number(quantity)
  const u = typeof unitCost === 'number' ? unitCost : Number(unitCost)
  return new Prisma.Decimal(q * u)
}

/**
 * Calculate total cost with indirect: directCost, indirectCost = directCost * (indirectPct/100), totalCost = direct + indirect.
 */
export function calculateBudgetLineTotal(
  quantity: Prisma.Decimal | number,
  unitCost: Prisma.Decimal | number,
  indirectPct: Prisma.Decimal | number
): { directCost: Prisma.Decimal; indirectCost: Prisma.Decimal; totalCost: Prisma.Decimal } {
  const q = typeof quantity === 'number' ? quantity : Number(quantity)
  const u = typeof unitCost === 'number' ? unitCost : Number(unitCost)
  const pct = typeof indirectPct === 'number' ? indirectPct : Number(indirectPct)
  const directCost = new Prisma.Decimal(q * u)
  const indirectCost = directCost.mul(pct / 100)
  const totalCost = directCost.add(indirectCost)
  return { directCost, indirectCost, totalCost }
}

/**
 * Sum of directCostTotal for version total (server-side).
 */
export function sumLineTotals(totals: (number | Prisma.Decimal)[]): number {
  return totals.reduce<number>((acc, t) => acc + Number(t), 0)
}
