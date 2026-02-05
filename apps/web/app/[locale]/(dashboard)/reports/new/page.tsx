import { redirectToLogin } from '@/lib/i18n-redirect'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { prisma } from '@repo/database'
import { ReportBuilder } from '@/components/reports/report-builder'

export default async function NewReportPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const projects = await prisma.project.findMany({
    where: { orgId: org.orgId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="mx-auto w-full max-w-[90rem] p-6">
      <div className="mb-6">
        <Link
          href="/reports"
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Reports
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Create report
      </h1>
      <ReportBuilder projects={projects} />
    </div>
  )
}
