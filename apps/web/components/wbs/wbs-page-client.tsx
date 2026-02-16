'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { WbsTree } from './wbs-tree'
import { WbsFormDialog, type WbsNodeOption } from './wbs-form-dialog'
import type { WbsItemRow } from './wbs-item'
import type { WbsNodeWithChildren } from '@/app/actions/wbs'
import {
  createWBSItem,
  updateWBSItem,
  deleteWBSItem,
  reorderWBSItems,
} from '@/app/actions/wbs'
import type { CreateWBSItemInput, UpdateWBSItemInput } from '@repo/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, FileDown } from 'lucide-react'

function flattenNodes(nodes: WbsItemRow[]): WbsItemRow[] {
  const out: WbsItemRow[] = []
  for (const n of nodes) {
    out.push(n)
    if (n.children?.length) out.push(...flattenNodes(n.children))
  }
  return out
}

function filterTreeBySearch(roots: WbsItemRow[], query: string): WbsItemRow[] {
  if (!query.trim()) return roots
  const q = query.toLowerCase()
  const matches = (n: WbsItemRow) =>
    n.code?.toLowerCase().includes(q) ||
    n.name?.toLowerCase().includes(q) ||
    (n.description && String(n.description).toLowerCase().includes(q))

  function filterNodes(nodes: WbsItemRow[]): WbsItemRow[] {
    return nodes
      .map((n) => ({
        ...n,
        children: filterNodes(n.children || []),
      }))
      .filter((n) => matches(n) || (n.children && n.children.length > 0))
  }
  return filterNodes(roots)
}

function flattenForParentOptions(
  nodes: WbsNodeWithChildren[],
  out: WbsNodeOption[] = []
): WbsNodeOption[] {
  for (const n of nodes) {
    if (n.category === 'PHASE' || n.category === 'ACTIVITY') {
      out.push({ id: n.id, code: n.code, name: n.name, category: n.category })
      flattenForParentOptions(n.children, out)
    }
  }
  return out
}

function toWbsItemRow(n: WbsNodeWithChildren): WbsItemRow {
  return {
    id: n.id,
    code: n.code,
    name: n.name,
    category: n.category,
    parentId: n.parentId,
    description: n.description,
    unit: n.unit,
    quantity: n.quantity,
    sortOrder: n.sortOrder,
    active: n.active,
    children: n.children.map(toWbsItemRow),
  }
}

function updateNodeInTree(
  roots: WbsItemRow[],
  nodeId: string,
  patch: { name?: string; estimatedDuration?: number | null }
): WbsItemRow[] {
  return roots.map((r) => {
    if (r.id === nodeId) {
      return {
        ...r,
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.estimatedDuration !== undefined && { quantity: patch.estimatedDuration }),
      }
    }
    if (r.children.length > 0) {
      return {
        ...r,
        children: updateNodeInTree(r.children, nodeId, patch),
      }
    }
    return r
  })
}

type WbsPageClientProps = {
  projectId: string
  tree: WbsNodeWithChildren[]
  costMap: Record<
    string,
    {
      estimatedTotal: number
      actualTotal: number
      variance: number
      varianceStatus: 'under' | 'on_track' | 'over'
    }
  >
  canEdit: boolean
}

export function WbsPageClient({
  projectId,
  tree,
  costMap,
  canEdit,
}: WbsPageClientProps) {
  const t = useTranslations('wbs')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [roots, setRoots] = useState<WbsItemRow[]>(() => tree.map(toWbsItemRow))

  useEffect(() => {
    setRoots(tree.map(toWbsItemRow))
  }, [tree])

  const filteredRoots = useMemo(
    () => filterTreeBySearch(roots, searchQuery),
    [roots, searchQuery]
  )

  const stats = useMemo(() => {
    const flat = flattenNodes(roots)
    return {
      phases: flat.filter((n) => n.category === 'PHASE').length,
      tasks: flat.filter((n) => ['TASK', 'ACTIVITY'].includes(n.category)).length,
      subtasks: flat.filter((n) => n.category === 'SUBTASK').length,
      items: flat.filter((n) => n.category === 'BUDGET_ITEM').length,
    }
  }, [roots])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editNodeId, setEditNodeId] = useState<string | null>(null)
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null)
  const [defaultValues, setDefaultValues] = useState<
    Partial<{
      name: string
      description: string | null
      type: 'PHASE' | 'ACTIVITY' | 'TASK'
      parentId: string | null
      estimatedDuration: number | null
      unit: string | null
    }>
  >({})

  const parentOptions = flattenForParentOptions(tree)

  async function handleSubmit(
    projId: string,
    data: CreateWBSItemInput | UpdateWBSItemInput,
    nodeId?: string
  ) {
    if (nodeId) {
      const result = await updateWBSItem(nodeId, projId, data)
      if (result?.error) return result
    } else {
      const result = await createWBSItem(projId, data as CreateWBSItemInput)
      if (result?.error) return result
    }
    router.refresh()
    setDialogOpen(false)
    return { success: true }
  }

  function openCreate(parent: WbsItemRow | null) {
    setDialogMode('create')
    setEditNodeId(null)
    setDefaultParentId(parent?.id ?? null)
    setDefaultValues({
      name: '',
      description: '',
      type: (parent?.category === 'PHASE' ? 'ACTIVITY' : parent ? 'TASK' : 'PHASE') as 'PHASE' | 'ACTIVITY' | 'TASK',
      parentId: parent?.id ?? null,
      estimatedDuration: undefined,
      unit: '',
    })
    setDialogOpen(true)
  }

  function openEdit(node: WbsItemRow) {
    setDialogMode('edit')
    setEditNodeId(node.id)
    setDefaultParentId(null)
    setDefaultValues({
      name: node.name,
      description: node.description ?? '',
      type: node.category as 'PHASE' | 'ACTIVITY' | 'TASK',
      parentId: node.parentId,
      estimatedDuration: node.quantity != null ? Number(node.quantity) : undefined,
      unit: node.unit ?? '',
    })
    setDialogOpen(true)
  }

  async function handleDelete(node: WbsItemRow) {
    if (!confirm(`Delete "${node.name}" and all its children?`)) return
    await deleteWBSItem(node.id, projectId)
    router.refresh()
  }

  async function handleReorder(parentId: string | null, orderedIds: string[]) {
    const result = await reorderWBSItems(projectId, parentId, orderedIds)
    if (!result || 'error' in result) return
    router.refresh()
  }

  function handleInlineUpdate(
    nodeId: string,
    data: { name?: string; estimatedDuration?: number | null }
  ) {
    const prevRoots = roots
    setRoots((r) => updateNodeInTree(r, nodeId, data))
    startTransition(async () => {
      const result = await updateWBSItem(nodeId, projectId, data)
      if (result?.error) {
        setRoots(prevRoots)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex gap-2">
            <Button type="button" variant="default" onClick={() => openCreate(null)}>
              {t('addPhase')}
            </Button>
            <Button type="button" variant="outline" disabled>
              <FileDown className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalPhases')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.phases}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalTasks')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.tasks}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalSubtasks')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.subtasks}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('totalItems')}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            {stats.items}
          </p>
        </div>
      </div>

      {filteredRoots.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery ? t('noResultsFound') : t('noWbsItemsYet')}
          </p>
        </div>
      ) : (
        <WbsTree
          roots={filteredRoots}
        costMap={costMap}
        canEdit={canEdit}
        onEdit={openEdit}
        onDelete={handleDelete}
        onAddChild={openCreate}
        onReorder={handleReorder}
        onInlineUpdate={handleInlineUpdate}
        isPending={isPending}
      />
      )}
      <WbsFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        projectId={projectId}
        mode={dialogMode}
        parentOptions={parentOptions}
        defaultParentId={defaultParentId}
        defaultValues={defaultValues}
        nodeId={editNodeId ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
