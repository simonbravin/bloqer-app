export const defaultLocale = 'es' as const
export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]
