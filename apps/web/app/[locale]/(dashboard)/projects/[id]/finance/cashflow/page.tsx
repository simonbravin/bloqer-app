import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getLocale } from 'next-intl/server'
import { prisma } from '@repo/database'
import { getProjectCashflowData } from '@/app/actions/dashboard'
import { CashflowChart } from '@/components/dashboard/cashflow-chart'
import { getTranslations } from 'next-intl/server'

type PageProps = {
  params: Promise<{ id: string }>
}

/**
 * Project cashflow page - income vs expenses for the last 6 months
 */
export default async function ProjectCashflowPage({ params }: PageProps) {
  const session = await getSession()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) {
    redirect(`/${locale}/login`)
  }

  const { id: projectId } = await params

  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId: orgContext.orgId },
    select: { id: true, name: true, projectNumber: true },
  })

  if (!project) {
    notFound()
  }

  const cashflowData = await getProjectCashflowData(
    orgContext.orgId,
    projectId
  )
  const t = await getTranslations('dashboard')

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t('cashflowTitle')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {project.name} — {t('cashflowSubtitle')}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <CashflowChart data={cashflowData} />
      </div>
    </div>
  )
}
