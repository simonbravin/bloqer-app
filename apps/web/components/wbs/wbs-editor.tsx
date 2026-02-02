'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { WbsTreeInteractive } from './wbs-tree-interactive'
import { WbsNodeFormDialog } from './wbs-node-form-dialog'
import { Search, Plus, FileDown } from 'lucide-react'

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

interface WbsEditorProps {
  nodes: WbsEditorNode[]
  projectId: string
  canEdit: boolean
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

export function WbsEditor({ nodes, projectId, canEdit }: WbsEditorProps) {
  const t = useTranslations('wbs')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedParent, setSelectedParent] = useState<string | null>(null)

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
      [...arr].sort((a, b) => a.code.localeCompare(b.code))

    function buildTree(parentId: string | null): TreeNode[] {
      return sorted(byParent.get(parentId) ?? []).map((node) => ({
        ...node,
        children: buildTree(node.id),
      }))
    }
    return buildTree(null)
  }, [filteredNodes])

  function handleAddNode(parentId: string | null = null) {
    setSelectedParent(parentId)
    setShowAddDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

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
