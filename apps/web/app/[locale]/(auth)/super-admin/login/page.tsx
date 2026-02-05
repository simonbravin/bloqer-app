import { SuperAdminLoginForm } from '@/components/auth/super-admin-login-form'
import { Shield } from 'lucide-react'

export default function SuperAdminLoginPage() {
  return (
    <div className="flex w-full max-w-md shrink-0 flex-col items-center justify-center px-4">
      <div className="w-full overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-xl dark:border-amber-900/50 dark:bg-slate-900">
        <div className="border-b border-amber-200 bg-amber-50/80 px-6 py-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" aria-hidden />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Super Admin
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Acceso exclusivo al portal de administración
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SuperAdminLoginForm />
        </div>
      </div>
    </div>
  )
}
