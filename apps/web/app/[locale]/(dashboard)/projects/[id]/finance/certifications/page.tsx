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
    <div className="space-y-6">
      <CertificationsListClient
        projectId={projectId}
        certifications={certifications}
        approvedTotal={approvedTotal}
        basePath="finance"
      />
    </div>
  )
}
