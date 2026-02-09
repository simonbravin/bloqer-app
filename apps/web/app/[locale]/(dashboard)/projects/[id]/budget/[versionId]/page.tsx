import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirect } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@repo/database'
import { listWbsTemplatesForLibrary } from '@/app/actions/wbs'
import { BudgetVersionStatusDropdown } from '@/components/budget/budget-version-status-dropdown'
import { BudgetVersionTabsWithSearch } from '@/components/budget/budget-version-tabs-with-search'
import { BudgetVersionExport } from '@/components/budget/budget-version-export'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { serializeForClient } from '@/lib/utils/serialization'
import type { BudgetTreeNode } from '@/components/budget/budget-tree-table-admin'

type PageProps = {
  params: Promise<{ locale?: string; id: string; versionId: string }>
}

export default async function BudgetVersionPage({ params }: PageProps) {
  const session = await getSession()
  const { id: projectId, versionId, locale } = await params
  if (!session?.user?.id) redirect({ href: '/login', locale: locale ?? 'es' })
  const userId = session!.user!.id

  const org = await getOrgContext(userId)
  if (!org) redirect({ href: '/login', locale: locale ?? 'es' })
  const { orgId, role } = org as NonNullable<typeof org>

  const versionRaw = await prisma.budgetVersion.findFirst({
    where: {
      id: versionId,
      projectId,
      orgId,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          projectNumber: true,
        },
      },
      budgetLines: {
        include: {
          wbsNode: {
            select: {
              id: true,
              code: true,
              name: true,
              parentId: true,
              category: true,
            },
          },
          resources: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              resourceType: true,
              quantity: true,
              unitCost: true,
              sortOrder: true,
            },
          },
        },
        orderBy: [{ wbsNode: { code: 'asc' } }, { sortOrder: 'asc' }],
      },
      createdBy: {
        select: {
          user: { select: { fullName: true, email: true } },
        },
      },
      approvedBy: {
        select: {
          user: { select: { fullName: true, email: true } },
        },
      },
    },
  })

  if (!versionRaw) notFound()

  const wbsTemplates = await listWbsTemplatesForLibrary()

  type VersionWithRelations = typeof versionRaw
  const version = serializeForClient(versionRaw) as unknown as VersionWithRelations

  const wbsGroups = new Map<
    string,
    Array<(typeof version.budgetLines)[number]>
  >()
  for (const line of version.budgetLines) {
    const wbsId = line.wbsNode.id
    if (!wbsGroups.has(wbsId)) wbsGroups.set(wbsId, [])
    wbsGroups.get(wbsId)!.push(line)
  }

  function buildTree(
    parentId: string | null
  ): BudgetTreeNode[] {
    const nodes: BudgetTreeNode[] = []
    wbsGroups.forEach((lines, wbsId) => {
      const firstLine = lines[0]
      if (firstLine.wbsNode.parentId !== parentId) return
      const treeLines = lines.map((line) => ({
        id: line.id,
        description: line.description,
        unit: line.unit,
        quantity: Number(line.quantity),
        directCostTotal: Number(line.directCostTotal),
        overheadPct: Number(line.overheadPct ?? 0),
        financialPct: Number(line.financialPct ?? 0),
        profitPct: Number(line.profitPct ?? 0),
        taxPct: Number(line.taxPct ?? 0),
        resources: (line.resources ?? []).map((r: { id: string; resourceType: string; quantity: unknown; unitCost: unknown; sortOrder: number }) => ({
          id: r.id,
          resourceType: r.resourceType,
          quantity: Number(r.quantity),
          unitCost: Number(r.unitCost),
        })),
      }))
      nodes.push({
        wbsNode: {
          id: firstLine.wbsNode.id,
          code: firstLine.wbsNode.code,
          name: firstLine.wbsNode.name,
          category: firstLine.wbsNode.category ?? 'ITEM',
        },
        lines: treeLines,
        children: buildTree(wbsId),
      })
    })
    return nodes.sort((a, b) =>
      a.wbsNode.code.localeCompare(b.wbsNode.code)
    )
  }

  const treeData = buildTree(null)

  const totalDirectCostNum = version.budgetLines.reduce(
    (sum: number, line: (typeof version.budgetLines)[number]) => sum + Number(line.directCostTotal),
    0
  )

  function lineSaleTotal(line: (typeof version.budgetLines)[number]): number {
    const directUnit = Number(line.directCostTotal) / Number(line.quantity) || 0
    const oh = line.overheadPct != null ? Number(line.overheadPct) : 0
    const fin = line.financialPct != null ? Number(line.financialPct) : 0
    const prof = line.profitPct != null ? Number(line.profitPct) : 0
    const tax = line.taxPct != null ? Number(line.taxPct) : 0
    let price = directUnit
    price += price * (oh / 100)
    price += price * (fin / 100)
    price += price * (prof / 100)
    price += price * (tax / 100)
    return price * Number(line.quantity)
  }

  const projectTotalSale = version.budgetLines.reduce(
    (sum: number, line: (typeof version.budgetLines)[number]) => sum + lineSaleTotal(line),
    0
  )

  const summaryData = version.budgetLines.map((line: (typeof version.budgetLines)[number]) => ({
    code: line.wbsNode.code,
    description: line.description,
    unit: line.unit,
    quantity: Number(line.quantity),
    unitPrice: Number(line.quantity)
      ? Number(line.directCostTotal) / Number(line.quantity)
      : 0,
    total: Number(line.directCostTotal),
    overheadPct: Number(line.overheadPct ?? 0),
    financialPct: Number(line.financialPct ?? 0),
    profitPct: Number(line.profitPct ?? 0),
    taxPct: Number(line.taxPct ?? 0),
  }))

  const canEdit =
    ['EDITOR', 'ADMIN', 'OWNER'].includes(role) && version.status === 'DRAFT'
  const canChangeStatus = ['ADMIN', 'OWNER'].includes(role)
  const canSeeAdmin = ['ADMIN', 'OWNER'].includes(role)

  const t = await getTranslations('budget')

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/projects/${projectId}/budget`}>
          ← {t('backToVersions')}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {version.project.name}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Versión: {version.versionCode} • {version.project.projectNumber}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BudgetVersionStatusDropdown
            versionId={version.id}
            projectId={projectId}
            currentStatus={version.status}
            canEdit={canChangeStatus}
          />
          {(version.status === 'BASELINE' || version.status === 'APPROVED') && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${projectId}/budget/${version.id}/materials`}>
                <Package className="mr-1.5 h-4 w-4" />
                Ver Materiales
              </Link>
            </Button>
          )}
          <BudgetVersionExport
            versionId={version.id}
            versionCode={version.versionCode}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>
          Creado por <strong>{version.createdBy!.user.fullName}</strong>{' '}
          {new Date(version.createdAt as unknown as string).toLocaleDateString('es-AR', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
        {version.approvedBy && version.approvedAt && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
            Aprobado por <strong>{version.approvedBy!.user.fullName}</strong>{' '}
            {new Date(version.approvedAt as unknown as string).toLocaleDateString('es-AR', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
        )}
      </div>

      <BudgetVersionTabsWithSearch
        treeData={treeData}
        version={{
          id: version.id,
          markupMode: version.markupMode,
          globalOverheadPct: Number(version.globalOverheadPct),
          globalFinancialPct: Number(version.globalFinancialPct),
          globalProfitPct: Number(version.globalProfitPct),
          globalTaxPct: Number(version.globalTaxPct),
        }}
        totalDirectCostNum={totalDirectCostNum}
        summaryData={summaryData}
        projectTotalSale={projectTotalSale}
        canEdit={canEdit}
        canSeeAdmin={canSeeAdmin}
        projectId={projectId}
        wbsTemplates={wbsTemplates}
      />
    </div>
  )
}
