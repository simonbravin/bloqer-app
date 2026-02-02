import { redirect as i18nRedirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export async function redirectToLogin() {
  const locale = await getLocale()
  return i18nRedirect({ href: '/login', locale })
}

export async function redirectTo(path: string) {
  const locale = await getLocale()
  return i18nRedirect({ href: path, locale })
}
