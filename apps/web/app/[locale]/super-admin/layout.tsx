import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { auth } from '@/lib/auth'
import { SuperAdminSidebar } from '@/components/layout/super-admin-sidebar'
import { SuperAdminLoginForm } from '@/components/auth/super-admin-login-form'
import { Shield } from 'lucide-react'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const locale = await getLocale()
  if (!session?.user?.id) {
    return (
      <div className="fixed inset-0 flex items-center justify-center overflow-auto bg-slate-100 p-4 dark:bg-slate-950">
        <div
          className="w-full overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-xl dark:border-amber-900/50 dark:bg-slate-900"
          style={{ width: 'min(100%, 420px)', minWidth: '320px' }}
        >
          <div className="border-b border-amber-200 bg-amber-50/80 px-8 py-6 dark:border-amber-900/50 dark:bg-amber-950/30">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Super Admin
                </h1>
                <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
                  Acceso exclusivo al portal de administración
                </p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <SuperAdminLoginForm />
          </div>
        </div>
      </div>
    )
  }
  if (!session.user.isSuperAdmin) {
    return redirect({ href: '/unauthorized', locale })
  }
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <SuperAdminSidebar userName={session.user.name ?? session.user.email ?? undefined} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
