import { redirectToLogin, redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { LocalSupplierForm } from '@/components/suppliers/local-supplier-form'

export default async function NewLocalSupplierPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  if (!['EDITOR', 'ADMIN', 'OWNER'].includes(org.role)) {
    return redirectTo('/suppliers')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/suppliers"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Suppliers
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Add Local Supplier
      </h1>
      <LocalSupplierForm />
    </div>
  )
}
