import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/app/actions/projects'
import { getCommitmentById } from '@/app/actions/materials'
import { getPartiesForProject } from '@/app/actions/finance'
import { listWbsNodesForProject } from '@/app/actions/finance-transactions'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { PurchaseOrderEditForm } from '@/components/finance/purchase-order-edit-form'

interface PageProps {
  params: Promise<{ id: string; commitmentId: string; locale?: string }>
}

export default async function PurchaseOrderEditPage({ params }: PageProps) {
  const { id: projectId, commitmentId } = await params

  const [project, commitment, parties, wbsNodes] = await Promise.all([
    getProject(projectId),
    getCommitmentById(commitmentId),
    getPartiesForProject(projectId, 'SUPPLIER'),
    listWbsNodesForProject(projectId),
  ])

  if (!project) notFound()
  if (!commitment || commitment.projectId !== projectId) notFound()
  if (commitment.status !== 'DRAFT') notFound()

  return (
    <div className="erp-view-container space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${projectId}/finance/purchase-orders/${commitmentId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la orden
          </Link>
        </Button>
      </div>
      <PurchaseOrderEditForm
        commitment={commitment}
        parties={parties.map((p) => ({ id: p.id, name: p.name }))}
        wbsNodes={wbsNodes}
      />
    </div>
  )
}
