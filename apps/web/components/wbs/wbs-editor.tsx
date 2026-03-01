'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { reorderWBSItems } from '@/app/actions/wbs'
import { toast } from 'sonner'
import { Link } from '@/i18n/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WbsTreeInteractive } from './wbs-tree-interactive'
import { WbsNodeFormDialog } from './wbs-node-form-dialog'
import { Search, Plus, FileDown, ExternalLink } from 'lucide-react'

export interface WbsEditorNode {
  id: string
  code: string
  name: string
  category: string
  parentId: string | null
  unit: string
  quantity: number
  description: string | null
  sortOrder: number
}

export type BudgetVersionOption = {
  id: string
  versionCode: string
  status: string
}

interface WbsEditorProps {
  nodes: WbsEditorNode[]
  projectId: string
  canEdit: boolean
  budgetVersions?: BudgetVersionOption[]
  selectedVersionId?: string | null
}

interface TreeNode {
  id: string
  code: string
  name: string
  category: string
  parentId: string | null
  unit: string
  quantity: number
  description: string | null
  sortOrder: number
  children: TreeNode[]
}

export function WbsEditor({
  nodes,
  projectId,
  canEdit,
  budgetVersions = [],
  selectedVersionId: initialVersionId = null,
}: WbsEditorProps) {
  const t = useTranslations('wbs')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedParent, setSelectedParent] = useState<string | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialVersionId ?? budgetVersions[0]?.id ?? null
  )

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes
    const q = searchQuery.toLowerCase()
    return nodes.filter(
      (node) =>
        node.code.toLowerCase().includes(q) ||
        node.name.toLowerCase().includes(q) ||
        (node.description && String(node.description).toLowerCase().includes(q))
    )
  }, [nodes, searchQuery])

  const treeData = useMemo(() => {
    const byParent = new Map<string | null, WbsEditorNode[]>()
    for (const n of filteredNodes) {
      const key = n.parentId
      if (!byParent.has(key)) byParent.set(key, [])
      byParent.get(key)!.push(n)
    }
    const sorted = (arr: WbsEditorNode[]) =>
      [...arr].sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))

    function buildTree(parentId: string | null): TreeNode[] {
      return sorted(byParent.get(parentId) ?? []).map((node) => ({
        ...node,
        children: buildTree(node.id),
      }))
    }
    return buildTree(null)
  }, [filteredNodes])

  const router = useRouter()

  function handleAddNode(parentId: string | null = null) {
    setSelectedParent(parentId)
    setShowAddDialog(true)
  }

  async function handleReorder(parentId: string | null, orderedNodeIds: string[]) {
    const result = await reorderWBSItems(projectId, parentId, orderedNodeIds)
    if (result && 'error' in result) {
      toast.error(result.error ?? t('error', { defaultValue: 'Error' }))
      return
    }
    toast.success(t('reorderSuccess', { defaultValue: 'Orden actualizado' }))
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {budgetVersions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t('budgetVersion', { defaultValue: 'Versión de presupuesto' })}
            </span>
            <Select
              value={selectedVersionId ?? ''}
              onValueChange={(v) => setSelectedVersionId(v || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('selectVersion', { defaultValue: 'Seleccionar' })} />
              </SelectTrigger>
              <SelectContent>
                {budgetVersions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.versionCode}{' '}
                    {v.status === 'APPROVED'
                      ? `(${t('approved', { defaultValue: 'Aprobado' })})`
                      : v.status === 'BASELINE'
                        ? `(${t('baseline', { defaultValue: 'Base' })})`
                        : `(${v.status})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedVersionId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${projectId}/budget/${selectedVersionId}`}>
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  {t('viewInBudget', { defaultValue: 'Ver desglose en presupuesto' })}
                </Link>
              </Button>
            )}
          </div>
        )}

        {canEdit && (
          <>
            <Button onClick={() => handleAddNode()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addPhase')}
            </Button>

            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalPhases')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {nodes.filter((n) => n.category === 'PHASE').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalTasks')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {nodes.filter((n) => n.category === 'TASK').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalSubtasks')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {nodes.filter((n) => n.category === 'SUBTASK').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalItems')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {nodes.filter((n) => n.category === 'ITEM' || n.category === 'BUDGET_ITEM').length}
          </p>
        </div>
      </div>

      {filteredNodes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery ? t('noResultsFound') : t('noWbsItemsYet')}
          </p>
        </div>
      ) : (
        <WbsTreeInteractive
          data={treeData}
          projectId={projectId}
          canEdit={canEdit}
          onAddChild={handleAddNode}
          onReorder={handleReorder}
        />
      )}

      {showAddDialog && (
        <WbsNodeFormDialog
          projectId={projectId}
          parentId={selectedParent}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  )
}
