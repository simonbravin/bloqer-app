import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirect, notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@repo/database'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BudgetVersionStatusDropdown } from '@/components/budget/budget-version-status-dropdown'
import { BudgetLinesCompactTable } from '@/components/budget/budget-lines-compact-table'
import { BudgetSummaryTabClient } from '@/components/budget/budget-summary-tab-client'
import { MarkupConfiguration } from '@/components/budget/markup-configuration'
import { BudgetVersionExport } from '@/components/budget/budget-version-export'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Prisma } from '@repo/database'
import type { BudgetTreeNode } from '@/components/budget/budget-tree-table-admin'

type PageProps = {
  params: Promise<{ locale?: string; id: string; versionId: string }>
}

export default async function BudgetVersionPage({ params }: PageProps) {
  const session = await getSession()
  const { id: projectId, versionId, locale } = await params
  if (!session?.user?.id) redirect({ href: '/login', locale: locale ?? 'es' })

  const { orgId, role } = await getOrgContext(session.user.id)
  if (!orgId) redirect({ href: '/login', locale: locale ?? 'es' })

  const version = await prisma.budgetVersion.findFirst({
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
      lines: {
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

  if (!version) notFound()

  const wbsGroups = new Map<
    string,
    Array<(typeof version.lines)[number]>
  >()
  for (const line of version.lines) {
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
        resources: (line.resources ?? []).map((r) => ({
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

  const totalDirectCost = version.lines.reduce(
    (sum, line) => sum.add(line.directCostTotal),
    new Prisma.Decimal(0)
  )
  const totalDirectCostNum = Number(totalDirectCost)

  function lineSaleTotal(line: (typeof version.lines)[number]): number {
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

  const projectTotalSale = version.lines.reduce(
    (sum, line) => sum + lineSaleTotal(line),
    0
  )

  const summaryData = version.lines.map((line) => ({
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
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${projectId}/budget`}>
            ← {t('backToVersions')}
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {version.project.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Versión: {version.versionCode} • {version.project.projectNumber}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BudgetVersionStatusDropdown
              versionId={version.id}
              projectId={projectId}
              currentStatus={version.status}
              canEdit={canChangeStatus}
            />
            {(version.status === 'BASELINE' ||
              version.status === 'APPROVED') && (
              <Button asChild variant="outline">
                <Link
                  href={`/projects/${projectId}/budget/${version.id}/materials`}
                >
                  <Package className="mr-2 h-4 w-4" />
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

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
          <div>
            Creado por: <strong>{version.createdBy.user.fullName}</strong> el{' '}
            {new Date(version.createdAt).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {version.approvedBy && version.approvedAt && (
            <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
              <span className="text-green-800">
                Aprobado por:{' '}
                <strong>{version.approvedBy.user.fullName}</strong> el{' '}
                {new Date(version.approvedAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="lines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="lines">{t('linesTab')}</TabsTrigger>
          <TabsTrigger value="summary">{t('summaryTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="space-y-6">
          <MarkupConfiguration
            versionId={version.id}
            currentMode={version.markupMode}
            currentMarkups={{
              overheadPct: Number(version.globalOverheadPct),
              financialPct: Number(version.globalFinancialPct),
              profitPct: Number(version.globalProfitPct),
              taxPct: Number(version.globalTaxPct),
            }}
            directCostTotal={totalDirectCostNum}
            canEdit={canEdit}
          />
          <BudgetLinesCompactTable
            data={treeData}
            versionId={version.id}
            projectId={projectId}
            canEdit={canEdit}
            markupMode={version.markupMode}
          />
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <BudgetSummaryTabClient
            summaryData={summaryData}
            treeData={treeData}
            projectTotalSale={projectTotalSale}
            markups={{
              overheadPct: Number(version.globalOverheadPct),
              financialPct: Number(version.globalFinancialPct),
              profitPct: Number(version.globalProfitPct),
              taxPct: Number(version.globalTaxPct),
            }}
            canSeeAdmin={canSeeAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
