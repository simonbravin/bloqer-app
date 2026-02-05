import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { getCertificationsByProjectReport } from '@/app/actions/predefined-reports'
import { CertificationsReportClient } from '@/components/reports/certifications-report-client'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function CertificationsPage({ params }: PageProps) {
  const session = await getSession()
  const { locale } = await params
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const org = await getOrgContext(session.user.id)
  if (!org?.orgId) redirect(`/${locale}/login`)

  const data = await getCertificationsByProjectReport()

  return (
    <div className="mx-auto max-w-6xl w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Evolución de Certificaciones
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ingresos cobrados por proyecto (por estado)
        </p>
      </div>

      <CertificationsReportClient data={data} />
    </div>
  )
}
