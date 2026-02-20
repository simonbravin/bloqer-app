'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { MarkupConfiguration } from '@/components/budget/markup-configuration'
import { BudgetLinesCompactTable } from '@/components/budget/budget-lines-compact-table'
import { BudgetSummaryTabClient } from '@/components/budget/budget-summary-tab-client'
import type { BudgetTreeNode } from '@/components/budget/budget-tree-table-admin'
import { reorderWBSItems } from '@/app/actions/wbs'
import { toast } from 'sonner'
import { Search } from 'lucide-react'

type VersionForTabs = {
  id: string
  markupMode: string
  globalOverheadPct: number
  globalFinancialPct: number
  globalProfitPct: number
  globalTaxPct: number
}

type BudgetVersionTabsWithSearchProps = {
  treeData: BudgetTreeNode[]
  version: VersionForTabs
  totalDirectCostNum: number
  summaryData: Array<{
    code: string
    description: string
    unit: string
    quantity: number
    unitPrice: number
    total: number
    overheadPct: number
    financialPct: number
    profitPct: number
    taxPct: number
  }>
  projectTotalSale: number
  canEdit: boolean
  canSeeAdmin: boolean
  projectId: string
  wbsTemplates: Array<{ id: string; name: string; code: string; unit: string; hasResources?: boolean }>
}

export function BudgetVersionTabsWithSearch({
  treeData,
  version,
  totalDirectCostNum,
  summaryData,
  projectTotalSale,
  canEdit,
  canSeeAdmin,
  projectId,
  wbsTemplates,
}: BudgetVersionTabsWithSearchProps) {
  const t = useTranslations('budget')
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('breakdown')

  async function handleReorder(parentId: string | null, orderedWbsNodeIds: string[]) {
    const result = await reorderWBSItems(projectId, parentId, orderedWbsNodeIds)
    if (result && 'error' in result) {
      toast.error(t('error'), { description: result.error })
      return
    }
    router.refresh()
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <TabsList className="inline-flex h-9 gap-1 rounded-lg border border-border bg-card p-1">
          <TabsTrigger value="breakdown" className="px-3 py-1.5 text-sm font-medium">
            {t('breakdownTab')}
          </TabsTrigger>
          <TabsTrigger value="totals" className="px-3 py-1.5 text-sm font-medium">
            {t('totalsTab')}
          </TabsTrigger>
          <TabsTrigger value="summary" className="px-3 py-1.5 text-sm font-medium">
            {t('summaryTab')}
          </TabsTrigger>
        </TabsList>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchByCodeOrDescription')}
            className="h-9 pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('linesFirstPlanillaNote')}
      </p>

      <TabsContent value="summary" className="mt-4 space-y-6">
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

      <TabsContent value="totals" className="mt-4 space-y-6">
        <BudgetLinesCompactTable
          data={treeData}
          versionId={version.id}
          projectId={projectId}
          canEdit={canEdit}
          markupMode={version.markupMode}
          wbsTemplates={wbsTemplates}
          searchQuery={searchQuery}
          columnView="totals"
          onReorder={handleReorder}
        />
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
      </TabsContent>

      <TabsContent value="breakdown" className="mt-4 space-y-6">
        <BudgetLinesCompactTable
          data={treeData}
          versionId={version.id}
          projectId={projectId}
          canEdit={canEdit}
          markupMode={version.markupMode}
          wbsTemplates={wbsTemplates}
          searchQuery={searchQuery}
          columnView="breakdown"
          onReorder={handleReorder}
        />
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
      </TabsContent>
    </Tabs>
  )
}
