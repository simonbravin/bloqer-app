import { Prisma } from '@repo/database'

/**
 * Cálculo secuencial correcto de markups
 *
 * Flujo:
 * 1. Costo Directo (Material + MO + Subcontratos)
 * 2. + Gastos Generales (% sobre costo directo) = Subtotal 1
 * 3. + Gastos Financieros (% sobre subtotal 1) = Subtotal 2
 * 4. + Beneficio (% sobre subtotal 2) = Subtotal 3
 * 5. + IVA (% sobre subtotal 3) = TOTAL FINAL
 */
export interface BudgetCalculation {
  directCost: Prisma.Decimal
  overheadAmount: Prisma.Decimal
  subtotal1: Prisma.Decimal
  financialAmount: Prisma.Decimal
  subtotal2: Prisma.Decimal
  profitAmount: Prisma.Decimal
  subtotal3: Prisma.Decimal
  taxAmount: Prisma.Decimal
  totalPrice: Prisma.Decimal
}

export function calculateBudgetLine(
  directCost: number,
  overheadPct = 0,
  financialPct = 0,
  profitPct = 0,
  taxPct = 21
): BudgetCalculation {
  const dc = new Prisma.Decimal(directCost)
  const oh = new Prisma.Decimal(overheadPct).div(100)
  const fin = new Prisma.Decimal(financialPct).div(100)
  const prof = new Prisma.Decimal(profitPct).div(100)
  const tax = new Prisma.Decimal(taxPct).div(100)

  const directCostDecimal = dc
  const overheadAmount = directCostDecimal.mul(oh)
  const subtotal1 = directCostDecimal.add(overheadAmount)
  const financialAmount = subtotal1.mul(fin)
  const subtotal2 = subtotal1.add(financialAmount)
  const profitAmount = subtotal2.mul(prof)
  const subtotal3 = subtotal2.add(profitAmount)
  const taxAmount = subtotal3.mul(tax)
  const totalPrice = subtotal3.add(taxAmount)

  return {
    directCost: directCostDecimal,
    overheadAmount,
    subtotal1,
    financialAmount,
    subtotal2,
    profitAmount,
    subtotal3,
    taxAmount,
    totalPrice,
  }
}

/**
 * Calcular precio unitario con markups
 */
export function calculateUnitPrice(
  directUnitCost: number,
  overheadPct = 0,
  financialPct = 0,
  profitPct = 0,
  taxPct = 21
): number {
  const calc = calculateBudgetLine(
    directUnitCost,
    overheadPct,
    financialPct,
    profitPct,
    taxPct
  )
  return Number(calc.totalPrice)
}

/**
 * Calcular total de línea de presupuesto
 */
export function calculateBudgetLineTotal(
  quantity: number,
  directUnitCost: number,
  overheadPct = 0,
  financialPct = 0,
  profitPct = 0,
  taxPct = 21
): {
  unitPrice: number
  totalPrice: number
  breakdown: BudgetCalculation
} {
  const unitCalc = calculateBudgetLine(
    directUnitCost,
    overheadPct,
    financialPct,
    profitPct,
    taxPct
  )

  const qty = new Prisma.Decimal(quantity)
  const totalCalc: BudgetCalculation = {
    directCost: unitCalc.directCost.mul(qty),
    overheadAmount: unitCalc.overheadAmount.mul(qty),
    subtotal1: unitCalc.subtotal1.mul(qty),
    financialAmount: unitCalc.financialAmount.mul(qty),
    subtotal2: unitCalc.subtotal2.mul(qty),
    profitAmount: unitCalc.profitAmount.mul(qty),
    subtotal3: unitCalc.subtotal3.mul(qty),
    taxAmount: unitCalc.taxAmount.mul(qty),
    totalPrice: unitCalc.totalPrice.mul(qty),
  }

  return {
    unitPrice: Number(unitCalc.totalPrice),
    totalPrice: Number(totalCalc.totalPrice),
    breakdown: totalCalc,
  }
}

export type APULine = {
  resourceId: string
  resourceName: string
  resourceCode: string
  resourceUnit: string
  resourceUnitCost: Prisma.Decimal
  quantityPerUnit: Prisma.Decimal
  subtotal: Prisma.Decimal
}

export type APUResult = {
  directCost: Prisma.Decimal
  indirectCost: Prisma.Decimal
  totalUnitPrice: Prisma.Decimal
  resources: APULine[]
}

/**
 * Calculate APU (Unit Price Analysis - Análisis de Precio Unitario)
 *
 * @param resources - Array of resources with quantities
 * @param indirectCostPct - Indirect cost percentage (gastos generales + utilidad)
 * @returns APU breakdown with final unit price
 */
export function calculateAPU(
  resources: Array<{
    resourceId: string
    resourceName: string
    resourceCode: string
    resourceUnit: string
    resourceUnitCost: number
    quantityPerUnit: number
  }>,
  indirectCostPct = 0
): APUResult {
  const apuLines: APULine[] = resources.map((r) => {
    const unitCost = new Prisma.Decimal(r.resourceUnitCost)
    const qty = new Prisma.Decimal(r.quantityPerUnit)
    const subtotal = unitCost.mul(qty)

    return {
      resourceId: r.resourceId,
      resourceName: r.resourceName,
      resourceCode: r.resourceCode,
      resourceUnit: r.resourceUnit,
      resourceUnitCost: unitCost,
      quantityPerUnit: qty,
      subtotal,
    }
  })

  const directCost = apuLines.reduce(
    (sum, line) => sum.add(line.subtotal),
    new Prisma.Decimal(0)
  )
  const indirectCost = directCost.mul(new Prisma.Decimal(indirectCostPct)).div(100)
  const totalUnitPrice = directCost.add(indirectCost)

  return {
    directCost,
    indirectCost,
    totalUnitPrice,
    resources: apuLines,
  }
}

/**
 * Calculate budget line total
 *
 * @param quantity - Total quantity in metric computation (cómputo métrico)
 * @param unitPrice - Unit price from APU
 * @returns Total cost for this budget line
 */
export function calculateBudgetLineTotalAmount(
  quantity: number,
  unitPrice: number
): Prisma.Decimal {
  return new Prisma.Decimal(quantity).mul(new Prisma.Decimal(unitPrice))
}

/**
 * Calculate budget version total
 *
 * @param lines - Array of budget lines
 * @returns Sum of all line totals
 */
export function calculateBudgetVersionTotal(
  lines: Array<{ directCostTotal: Prisma.Decimal }>
): Prisma.Decimal {
  return lines.reduce(
    (sum, line) => sum.add(line.directCostTotal),
    new Prisma.Decimal(0)
  )
}
