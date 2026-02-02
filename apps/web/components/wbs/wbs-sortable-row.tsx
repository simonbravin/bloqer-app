'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { WbsItem, type WbsItemRow } from './wbs-item'
import type { WbsCostResult } from '@/app/actions/wbs'

type SortableWbsRowProps = {
  node: WbsItemRow
  depth: number
  costMap: Record<string, WbsCostResult>
  parentCode: string | null
  canEdit: boolean
  onEdit: (node: WbsItemRow) => void
  onDelete: (node: WbsItemRow) => void
  onAddChild: (parent: WbsItemRow) => void
  onInlineUpdate?: (nodeId: string, data: { name?: string; estimatedDuration?: number | null }) => void
  renderChildren?: (children: WbsItemRow[]) => React.ReactNode
}

export function WbsSortableRow({
  node,
  depth,
  costMap,
  parentCode,
  canEdit,
  onEdit,
  onDelete,
  onAddChild,
  onInlineUpdate,
  renderChildren,
}: SortableWbsRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const sortableProps =
    canEdit && renderChildren
      ? {
          setNodeRef,
          attributes: attributes as unknown as Record<string, unknown>,
          listeners,
          style,
          isDragging,
        }
      : undefined

  return (
    <WbsItem
      node={node}
      depth={depth}
      costMap={costMap}
      parentCode={parentCode}
      canEdit={canEdit}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddChild={onAddChild}
      onInlineUpdate={onInlineUpdate}
      sortableProps={sortableProps}
      renderChildren={renderChildren}
    />
  )
}
