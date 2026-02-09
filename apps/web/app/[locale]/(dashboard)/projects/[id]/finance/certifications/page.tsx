import { getProjectCertifications } from '@/app/actions/certifications'
import { getProject } from '@/app/actions/projects'
import { CertificationsListClient } from '@/components/certifications/certifications-list-client'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function FinanceCertificationsPage({ params }: PageProps) {
  const { id: projectId } = await params

  const [project, certifications] = await Promise.all([
    getProject(projectId),
    getProjectCertifications(projectId),
  ])

  if (!project) notFound()

  const approvedTotal = certifications
    .filter((c) => c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.totalAmount, 0)

  return (
    <div className="space-y-6 p-6">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Certificaciones
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registro de avance de obra y facturación del proyecto {project.name}
          </p>
        </div>

        <div className="mt-6">
          <CertificationsListClient
            projectId={projectId}
            certifications={certifications}
            approvedTotal={approvedTotal}
            basePath="finance"
          />
        </div>
      </div>
    </div>
  )
}
