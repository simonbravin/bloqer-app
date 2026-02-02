import { getSession } from '@/lib/session'
import { redirect } from '@/i18n/navigation'

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  let session = null
  try {
    session = await getSession()
  } catch {
    // Si auth/DB falla, redirigir a login para que el usuario pueda intentar
  }

  if (session?.user?.id) {
    return redirect({ href: '/dashboard', locale })
  }

  return redirect({ href: '/login', locale })
}
