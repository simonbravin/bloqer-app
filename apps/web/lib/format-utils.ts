/**
 * Format utilities for Argentine Spanish (es-AR) locale.
 * Used across Bloqer for currency, numbers, and dates.
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

/** Threshold above which we use compact format in KPIs/cards to avoid layout overflow */
const DISPLAY_CURRENCY_COMPACT_THRESHOLD = 1_000_000

/**
 * Currency for display in KPIs and cards. Uses compact notation (e.g. $1,75M) when
 * |amount| >= threshold to avoid very long numbers breaking layout. Use formatCurrency
 * for exports and when full value is required.
 */
export function formatCurrencyForDisplay(
  amount: number,
  currency: string = 'ARS',
  locale: string = 'es-AR',
  options?: { compactThreshold?: number; forceCompact?: boolean }
): string {
  const threshold = options?.compactThreshold ?? DISPLAY_CURRENCY_COMPACT_THRESHOLD
  if (options?.forceCompact || Math.abs(amount) >= threshold) {
    return formatCurrencyCompact(amount, locale, currency)
  }
  return formatCurrency(amount, currency, locale)
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

/**
 * Date as DD/MM/YYYY for inputs and display (Argentina / Spanish).
 * Use for Libro de Obra and any form that must show DD/MM/AAAA.
 */
export function formatDateDDMMYYYY(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Parse DD/MM/YYYY or D/M/YYYY string to Date, or null if invalid.
 */
export function parseDateDDMMYYYY(s: string): Date | null {
  const trimmed = (s ?? '').trim()
  if (!trimmed) return null
  const parts = trimmed.split('/').map((p) => parseInt(p, 10))
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const d = new Date(year, month - 1, day)
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null
  return d
}

/**
 * Relative time for notifications (e.g. "Hace 5 min", "Ayer", "14/02")
 */
export function formatRelativeTime(date: Date | string, locale = 'es-AR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3600_000)
  const diffDays = Math.floor(diffMs / 86400_000)
  if (diffMins < 1) return locale.startsWith('es') ? 'Ahora' : 'Now'
  if (diffMins < 60) return locale.startsWith('es') ? `Hace ${diffMins} min` : `${diffMins} min ago`
  if (diffHours < 24) return locale.startsWith('es') ? `Hace ${diffHours} h` : `${diffHours}h ago`
  if (diffDays === 1) return locale.startsWith('es') ? 'Ayer' : 'Yesterday'
  if (diffDays < 7) return locale.startsWith('es') ? `Hace ${diffDays} días` : `${diffDays} days ago`
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(d)
}
