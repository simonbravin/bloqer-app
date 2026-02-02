import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  localeDetection: false, // Siempre español por defecto, sin detectar idioma del navegador
})
