/**
 * Format utilities for Argentine Spanish (es-AR) locale.
 * Used across the Construction ERP for currency, numbers, and dates.
 */

/** Símbolo por moneda: ARS = $, USD = US$, resto = código */
export function getCurrencySymbol(currency: string): string {
  if (currency === 'ARS') return '$'
  if (currency === 'USD') return 'US$'
  if (currency === 'EUR') return '€'
  return currency
}

/**
 * Currency formatting (ARS primary). Usa símbolo explícito: $ para ARS, US$ para USD.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'ARS',
  locale: string = 'es-AR'
): string {
  const symbol = getCurrencySymbol(currency)
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${symbol} ${formatted}`.trim()
}

/**
 * Percentage formatting
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Number formatting with thousands separator
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'es-AR'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Compact number (1.2K, 3.4M)
 */
export function formatCompact(value: number, locale: string = 'es-AR'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

/**
 * Compact currency for charts (1.2K, 3.4M with currency prefix)
 */
export function formatCurrencyCompact(
  amount: number,
  locale: string = 'es-AR',
  currency: string = 'ARS'
): string {
  if (Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    })
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${formatter.format(amount)}`
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Date formatting
 */
export function formatDate(date: Date | string, locale = 'es-AR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Short date for tables/lists
 */
export function formatDateShort(date: Date | string | null, locale = 'es-AR'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(d)
}

/**
 * Date and time for audit / "Creado por X el DD/MM/YYYY HH:mm"
 */
export function formatDateTime(date: Date | string | null, locale = 'es-AR'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}
