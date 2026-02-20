import { ProjectFinanceTabs } from '@/components/finance/project-finance-tabs'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProjectFinanceLayout({ children, params }: LayoutProps) {
  const { id: projectId } = await params

  return (
    <div className="erp-stack">
      <ProjectFinanceTabs projectId={projectId} />
      {children}
    </div>
  )
}
