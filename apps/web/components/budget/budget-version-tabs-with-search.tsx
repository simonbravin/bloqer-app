'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { MarkupConfiguration } from '@/components/budget/markup-configuration'
import { BudgetLinesCompactTable } from '@/components/budget/budget-lines-compact-table'
import { BudgetSummaryTabClient } from '@/components/budget/budget-summary-tab-client'
import type { BudgetTreeNode } from '@/components/budget/budget-tree-table-admin'
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
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Tabs defaultValue="lines" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <TabsList className="inline-flex h-9 gap-1 rounded-lg border border-border bg-card p-1">
          <TabsTrigger value="lines" className="px-3 py-1.5 text-sm font-medium">
            {t('linesTab')}
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

      <TabsContent value="lines" className="space-y-6">
        <BudgetLinesCompactTable
          data={treeData}
          versionId={version.id}
          projectId={projectId}
          canEdit={canEdit}
          markupMode={version.markupMode}
          wbsTemplates={wbsTemplates}
          searchQuery={searchQuery}
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
    </Tabs>
  )
}
