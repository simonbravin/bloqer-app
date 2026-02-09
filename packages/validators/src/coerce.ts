import { z } from 'zod'

/** Decimal-like (e.g. Prisma Decimal) has toNumber(). */
type DecimalLike = { toNumber?: () => number }

/**
 * Converts value to number. Accepts number, string, or Decimal-like (e.g. Prisma Decimal).
 * Use for monetary/quantity fields when input may come from Prisma or forms.
 */
function toMonetaryNumber(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  const d = v as DecimalLike
  if (typeof d?.toNumber === 'function') return d.toNumber()
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Schema that accepts number, string, or Decimal-like and outputs number.
 * Use for monetary/quantity fields when parsing data that may come from Prisma.
 */
export const monetarySchema = z
  .union([z.number(), z.string(), z.any()])
  .transform((v: unknown) => toMonetaryNumber(v))

/**
 * Optional monetary: null/undefined -> undefined, otherwise number.
 */
export const monetaryOptionalSchema = z
  .union([z.number(), z.string(), z.any(), z.null(), z.undefined()])
  .transform((v: unknown): number | undefined => (v == null ? undefined : toMonetaryNumber(v)))
