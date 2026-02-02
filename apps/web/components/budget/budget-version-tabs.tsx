'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BudgetLinesClient } from './budget-lines-client'
import { ComputeSheetHierarchical } from './compute-sheet-hierarchical'
import { APUDetailModal } from './apu-detail-modal'
import { deleteBudgetLine } from '@/app/actions/budget'
import type { BudgetLineRow } from './budget-line-table'

type WbsOption = { id: string; code: string; name: string }
type VersionOption = { id: string; versionCode: string }

type ComputeSheetLine = {
  id: string
  wbsCode: string
  wbsName: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
  hasAPU: boolean
}

type WbsTreeNode = {
  id: string
  code: string
  name: string
  category: string
  parentId: string | null
  unit: string | null
  quantity: unknown
  children: WbsTreeNode[]
}

type BudgetVersionTabsProps = {
  projectId: string
  versionId: string
  version: { status: string; versionCode: string }
  lines: BudgetLineRow[]
  wbsTree: WbsTreeNode[]
  computeSheetLines: ComputeSheetLine[]
  versionTotal: number
  wbsOptions: WbsOption[]
  otherVersions: VersionOption[]
  canEdit: boolean
  canViewAdmin?: boolean
  defaultIndirectPct?: number
}

export function BudgetVersionTabs({
  projectId,
  versionId,
  version,
  lines,
  wbsTree,
  computeSheetLines,
  versionTotal,
  wbsOptions,
  otherVersions,
  canEdit,
  canViewAdmin = false,
  defaultIndirectPct,
}: BudgetVersionTabsProps) {
  const t = useTranslations('budget')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'lines' | 'compute'>('compute')
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)

  async function handleDeleteLine(lineId: string) {
    if (!confirm(t('confirmDeleteLine'))) return
    await deleteBudgetLine(lineId)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'lines' | 'compute')}
      >
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="lines" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            {t('budgetLines')}
          </TabsTrigger>
          <TabsTrigger value="compute" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            {t('computeSheet')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lines">
          <BudgetLinesClient
            projectId={projectId}
            versionId={versionId}
            version={version}
            lines={lines}
            wbsTree={wbsTree}
            versionTotal={versionTotal}
            wbsOptions={wbsOptions}
            otherVersions={otherVersions}
            canEdit={canEdit}
            canViewAdmin={canViewAdmin}
            defaultIndirectPct={defaultIndirectPct}
            onDelete={handleDeleteLine}
          />
        </TabsContent>

        <TabsContent value="compute">
          <ComputeSheetHierarchical
            wbsTree={wbsTree}
            lines={lines}
            canEdit={canEdit}
            onDelete={handleDeleteLine}
          />
          {selectedLineId && (
            <APUDetailModal
              lineId={selectedLineId}
              versionId={versionId}
              onClose={() => setSelectedLineId(null)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
