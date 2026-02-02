'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export interface WbsTreeNode {
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

interface WbsTreeViewProps {
  data: WbsTreeNode[]
  projectId?: string
  canEdit: boolean
  onAddChild: (parentId: string | null) => void
}

function TreeRow({
  node,
  depth,
  canEdit,
  onAddChild,
}: {
  node: WbsTreeNode
  depth: number
  canEdit: boolean
  onAddChild: (parentId: string | null) => void
}) {
  const hasChildren = node.children.length > 0

  return (
    <div className="w-full">
      <div
        className="flex items-center gap-2 border-b border-slate-100 py-2 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
        style={{ paddingLeft: depth * 24 }}
      >
        <span className="w-16 shrink-0 font-mono text-xs text-slate-500">
          {node.code}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{node.name}</span>
        <span className="shrink-0 text-xs text-slate-500">{node.category}</span>
        {node.unit && (
          <span className="shrink-0 text-xs text-slate-500">
            {node.quantity} {node.unit}
          </span>
        )}
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 px-2"
            onClick={() => onAddChild(node.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              canEdit={canEdit}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function WbsTreeView({
  data,
  canEdit,
  onAddChild,
}: WbsTreeViewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <span className="col-span-2">Code</span>
        <span className="col-span-4">Name</span>
        <span className="col-span-2">Type</span>
        <span className="col-span-2">Cant / Unit</span>
        {canEdit && <span className="col-span-2" />}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.map((node) => (
          <TreeRow
            key={node.id}
            node={node}
            depth={0}
            canEdit={canEdit}
            onAddChild={onAddChild}
          />
        ))}
      </div>
    </div>
  )
}
