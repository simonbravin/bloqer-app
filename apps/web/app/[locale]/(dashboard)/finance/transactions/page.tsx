import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { hasMinimumRole } from '@/lib/rbac'
import {
  listFinanceTransactions,
  listProjectsForFinance,
} from '@/app/actions/finance'
import { TransactionsListClient } from '@/components/finance/transactions-list-client'

type PageProps = {
  searchParams: Promise<{
    type?: string
    status?: string
    projectId?: string
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function FinanceTransactionsPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return notFound()
  const org = await getOrgContext(session.user.id)
  if (!org) return notFound()

  const params = await searchParams
  const [transactions, projects] = await Promise.all([
    listFinanceTransactions({
      type: params.type,
      status: params.status,
      projectId: params.projectId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    listProjectsForFinance(),
  ])
  const canCreate = hasMinimumRole(org.role, 'ACCOUNTANT')

  return (
    <div className="p-6">
      <TransactionsListClient
        transactions={transactions ?? []}
        projects={projects ?? []}
        canCreate={canCreate}
      />
    </div>
  )
}
