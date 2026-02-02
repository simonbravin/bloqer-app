import { notFound } from 'next/navigation'
import { redirectTo } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import { createFinanceTransactionWithLines } from '@/app/actions/finance'
import {
  listProjectsForFinance,
  listPartiesForFinance,
  listCurrencies,
  listWbsNodesForProject,
} from '@/app/actions/finance'
import { TransactionForm } from '@/components/finance/transaction-form'

export default async function NewFinanceTransactionPage() {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const canCreate = hasMinimumRole(org.role, 'ACCOUNTANT')
  if (!canCreate) return notFound()

  const [projects, parties, currencies] = await Promise.all([
    listProjectsForFinance(),
    listPartiesForFinance(),
    listCurrencies(),
  ])

  async function onSubmit(
    data: Parameters<typeof createFinanceTransactionWithLines>[0],
    lines: Parameters<typeof createFinanceTransactionWithLines>[1]
  ) {
    'use server'
    const result = await createFinanceTransactionWithLines(data, lines)
    if (result && 'id' in result && result.id) {
      return redirectTo(`/finance/transactions/${result.id}`)
    }
    return result
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/finance/transactions"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Transactions
        </Link>
      </div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        New transaction
      </h1>
      <TransactionForm
        projects={projects ?? []}
        parties={parties ?? []}
        currencies={currencies ?? []}
        fetchWbs={listWbsNodesForProject}
        onSubmit={onSubmit}
        onCancelHref="/finance/transactions"
      />
    </div>
  )
}
