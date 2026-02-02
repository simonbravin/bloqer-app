import { Prisma } from '@repo/database'

/**
 * Convert amount from transaction currency to base currency.
 * baseAmount = amount * exchangeRate
 */
export function toBaseAmount(amount: Prisma.Decimal | number, exchangeRate: number): Prisma.Decimal {
  const a = typeof amount === 'number' ? new Prisma.Decimal(amount) : amount
  return a.mul(exchangeRate)
}

/**
 * Sum amounts (Decimal or number) and return Decimal.
 */
export function sumAmounts(amounts: (Prisma.Decimal | number)[]): Prisma.Decimal {
  return amounts.reduce<Prisma.Decimal>(
    (acc, v) => acc.add(typeof v === 'number' ? new Prisma.Decimal(v) : v),
    new Prisma.Decimal(0)
  )
}
