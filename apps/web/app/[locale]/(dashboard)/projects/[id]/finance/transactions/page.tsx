import { getTranslations } from 'next-intl/server'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getLocale } from 'next-intl/server'
import { prisma } from '@repo/database'

export default async function ProjectFinanceTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  const locale = await getLocale()
  const { id } = await params

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const orgContext = await getOrgContext(session.user.id)
  if (!orgContext) {
    redirect(`/${locale}/login`)
  }

  const project = await prisma.project.findFirst({
    where: { id, orgId: orgContext.orgId },
    select: { id: true, name: true, projectNumber: true },
  })
  
  if (!project) {
    notFound()
  }
  
  const t = await getTranslations()
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('nav.transactions')}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {project.name}
        </p>
      </div>
      
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">
          Transacciones financieras del proyecto
        </p>
      </div>
    </div>
  )
}
