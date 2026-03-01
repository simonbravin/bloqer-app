'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { deleteWbsNode } from '@/app/actions/wbs'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { WbsNodeFormDialog } from './wbs-node-form-dialog'
import { formatNumber } from '@/lib/format-utils'

interface WbsTreeNode {
  id: string
  code: string
  name: string
  category: string
  parentId: string | null
  unit: string
  quantity: number
  description: string | null
  sortOrder: number
  children: WbsTreeNode[]
}

function getParentId(nodes: WbsTreeNode[], nodeId: string, parentId: string | null = null): string | null | undefined {
  for (const n of nodes) {
    if (n.id === nodeId) return parentId
    const found = getParentId(n.children, nodeId, n.id)
    if (found !== undefined) return found
  }
  return undefined
}

function getSiblingIds(nodes: WbsTreeNode[], parentId: string | null): string[] {
  if (parentId === null) return nodes.map((n) => n.id)
  for (const n of nodes) {
    if (n.id === parentId) return n.children.map((c) => c.id)
    const ids = getSiblingIds(n.children, parentId)
    if (ids.length > 0) return ids
  }
  return []
}

/** Static row (no DnD) to avoid hydration mismatch before client mount. */
function StaticRow({
  level,
  canEdit,
  children,
}: {
  level: number
  canEdit: boolean
  children: React.ReactNode
}) {
  return (
    <div
      style={{ marginLeft: `${level * 24}px` }}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
    >
      {canEdit && (
        <span className="cursor-default shrink-0 rounded p-1 text-slate-400">
          <GripVertical className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  )
}

/** Wraps row content with sortable ref/transform and drag handle. */
function SortableRow({
  id,
  level,
  canReorder,
  canEdit,
  children,
}: {
  id: string
  level: number
  canReorder: boolean
  canEdit: boolean
  children: React.ReactNode
}) {
  const { setNodeRef, transform, transition, attributes, listeners, isDragging } = useSortable({ id })
  return (
    <div
      ref={canReorder ? setNodeRef : undefined}
      style={{
        marginLeft: `${level * 24}px`,
        ...(canReorder ? { transform: CSS.Transform.toString(transform), transition } : {}),
        ...(isDragging ? { opacity: 0.5 } : {}),
      }}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
    >
      {canEdit && (
        <span
          className="cursor-grab touch-none shrink-0 rounded p-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
          {...(canReorder ? { ...listeners, ...attributes } : {})}
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  )
}

interface WbsTreeInteractiveProps {
  data: WbsTreeNode[]
  projectId: string
  canEdit: boolean
  onAddChild: (parentId: string | null) => void
  onReorder?: (parentId: string | null, orderedNodeIds: string[]) => Promise<void>
}

export function WbsTreeInteractive({
  data,
  projectId,
  canEdit,
  onAddChild,
  onReorder,
}: WbsTreeInteractiveProps) {
  const t = useTranslations('wbs')
  const router = useRouter()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingNode, setEditingNode] = useState<WbsTreeNode | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!onReorder || !over || active.id === over.id) return
    const parentIdResult = getParentId(data, String(active.id))
    if (parentIdResult === undefined) return
    const parentId = parentIdResult ?? null
    const siblingIds = getSiblingIds(data, parentId)
    const oldIndex = siblingIds.indexOf(String(active.id))
    const newIndex = siblingIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(siblingIds, oldIndex, newIndex)
    await onReorder(parentId, newOrder)
  }

  function toggleNode(nodeId: string) {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  async function handleDelete(nodeId: string) {
    if (!confirm(t('confirmDelete', { defaultValue: '¿Estás seguro de eliminar este nodo? Esta acción no se puede deshacer.' }))) return

    try {
      const result = await deleteWbsNode(nodeId)

      if (result.success) {
        toast.success(t('nodeDeleted', { defaultValue: 'Nodo eliminado' }), {
          description: t('nodeDeletedDesc', { defaultValue: 'El nodo se eliminó correctamente' }),
        })
        router.refresh()
      } else {
        toast.error(result.error ?? t('deleteError', { defaultValue: 'No se pudo eliminar el nodo' }))
      }
    } catch {
      toast.error(t('deleteError', { defaultValue: 'No se pudo eliminar el nodo' }))
    }
  }

  function renderNode(node: WbsTreeNode, level = 0) {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0
    const canAddChild = canEdit && node.category !== 'ITEM' && node.category !== 'BUDGET_ITEM'
    const childType =
      node.category === 'PHASE'
        ? 'TASK'
        : node.category === 'TASK'
          ? 'SUBTASK'
          : node.category === 'SUBTASK'
            ? 'ITEM'
            : null

    const categoryColors: Record<string, string> = {
      PHASE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      TASK: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      SUBTASK: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      ITEM: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      BUDGET_ITEM: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    }

    const canReorder = Boolean(canEdit && onReorder)
    const rowContent = (
      <>
          <button
            type="button"
            onClick={() => toggleNode(node.id)}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>

          <span className="font-mono text-sm font-medium text-slate-600 dark:text-slate-400">
            {node.code}
          </span>

          <Badge className={categoryColors[node.category] ?? 'bg-slate-100 text-slate-800'}>
            {t(`category${node.category}`, { defaultValue: node.category })}
          </Badge>

          <span className="flex-1 font-medium text-slate-900 dark:text-white">
            {node.name}
          </span>

          {(node.category === 'ITEM' || node.category === 'BUDGET_ITEM') && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium tabular-nums">
                {formatNumber(Number(node.quantity))}
              </span>
              <span className="text-slate-400">{node.unit}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {canAddChild && childType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddChild(node.id)}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t(`add${childType}`, { defaultValue: `Agregar ${childType}` })}
              </Button>
            )}

            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingNode(node)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('edit', { defaultValue: 'Editar' })}
                  </DropdownMenuItem>

                  {canAddChild && childType && (
                    <DropdownMenuItem onClick={() => onAddChild(node.id)}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t(`add${childType}`, { defaultValue: `Agregar ${childType}` })}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => handleDelete(node.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('delete', { defaultValue: 'Eliminar' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
      </>
    )

    return (
      <div key={node.id}>
        {!mounted ? (
          <StaticRow level={level} canEdit={canEdit}>
            {rowContent}
          </StaticRow>
        ) : (
          <SortableRow
            id={node.id}
            level={level}
            canReorder={canReorder}
            canEdit={canEdit}
          >
            {rowContent}
          </SortableRow>
        )}

        {node.description && (
          <div
            className="ml-14 mt-1 text-sm text-slate-500 dark:text-slate-400"
            style={{ marginLeft: `${level * 24 + 56}px` }}
          >
            {node.description}
          </div>
        )}

        {isExpanded && node.children.length > 0 && (
          <div className="mt-2 space-y-2">
            {!mounted ? (
              node.children.map((child) => renderNode(child, level + 1))
            ) : (
              <SortableContext
                items={node.children.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {node.children.map((child) => renderNode(child, level + 1))}
              </SortableContext>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="space-y-2">
        {data.map((node) => renderNode(node))}
        {editingNode && (
          <WbsNodeFormDialog
            projectId={projectId}
            parentId={editingNode.parentId}
            nodeToEdit={editingNode}
            onClose={() => setEditingNode(null)}
          />
        )}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="space-y-2">
        <SortableContext
          items={data.map((n) => n.id)}
          strategy={verticalListSortingStrategy}
        >
          {data.map((node) => renderNode(node))}
        </SortableContext>

      {editingNode && (
        <WbsNodeFormDialog
          projectId={projectId}
          parentId={editingNode.parentId}
          nodeToEdit={editingNode}
          onClose={() => setEditingNode(null)}
        />
      )}
      </div>
    </DndContext>
  )
}
