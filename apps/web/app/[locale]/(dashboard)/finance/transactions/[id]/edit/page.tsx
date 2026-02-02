import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import {
  getFinanceTransaction,
  updateFinanceTransaction,
  addFinanceLine,
  updateFinanceLine,
  deleteFinanceLine,
  listWbsNodesForProject,
} from '@/app/actions/finance'
import { TransactionEditClient } from '@/components/finance/transaction-edit-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function FinanceTransactionEditPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const { id } = await params
  const tx = await getFinanceTransaction(id)
  if (!tx) return notFound()
  if (tx.status !== 'DRAFT') return notFound()

  const canEdit = hasMinimumRole(org.role, 'ACCOUNTANT')
  if (!canEdit) return notFound()

  const wbsOptions = tx.projectId ? await listWbsNodesForProject(tx.projectId) : []

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/finance/transactions/${id}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← {tx.transactionNumber}
        </Link>
        <span className="mx-2 text-gray-400">|</span>
        <Link
          href="/finance/transactions"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Transactions
        </Link>
      </div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
        Edit transaction
      </h1>
      <TransactionEditClient
        transactionId={id}
        transaction={tx}
        wbsOptions={wbsOptions}
        updateTransaction={updateFinanceTransaction}
        addLine={addFinanceLine}
        updateLine={updateFinanceLine}
        deleteLine={deleteFinanceLine}
        fetchWbs={listWbsNodesForProject}
      />
    </div>
  )
}
