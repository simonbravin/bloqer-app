import { redirectToLogin } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'

export default async function ReportsPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const reports = await prisma.savedReport.findMany({
    where: {
      orgId: org.orgId,
      OR: [
        { visibility: 'SHARED' },
        { createdByOrgMemberId: org.memberId },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      createdBy: {
        select: { user: { select: { fullName: true } } },
      },
      runs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, createdAt: true, format: true, status: true },
      },
    },
  })

  const entityLabels: Record<string, string> = {
    PROJECT: 'Projects',
    FINANCE_TRANSACTION: 'Finance Transactions',
    BUDGET_LINE: 'Budget Lines',
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Reports
        </h1>
        <Link
          href="/reports/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create report
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-600">
          No saved reports. Create one to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const lastRun = report.runs[0]
            const creatorName =
              report.createdBy?.user?.fullName ?? 'Unknown'
            return (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div>
                  <Link
                    href={`/reports/${report.id}`}
                    className="font-medium text-gray-900 hover:underline dark:text-white"
                  >
                    {report.name}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {entityLabels[report.entityType] ?? report.entityType} • by{' '}
                    {creatorName}
                    {lastRun && (
                      <> • Last run {new Date(lastRun.createdAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/reports/${report.id}/run`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Run
                  </Link>
                  <Link
                    href={`/reports/${report.id}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
