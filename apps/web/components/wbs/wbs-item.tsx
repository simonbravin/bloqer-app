'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { IconChevronDown, IconChevronRight } from '@/components/ui/icons'
import { formatCurrency } from '@/lib/format-utils'
import type { WbsCostResult } from '@/app/actions/wbs'
import { cn } from '@/lib/utils'

export type WbsItemRow = {
  id: string
  code: string
  name: string
  category: string
  parentId: string | null
  description: string | null
  unit: string | null
  quantity: unknown
  sortOrder: number
  active: boolean
  children: WbsItemRow[]
}

type SortableProps = {
  setNodeRef: (element: HTMLElement | null) => void
  attributes: Record<string, unknown>
  listeners: Record<string, unknown> | undefined
  style: { transform?: string; transition?: string }
  isDragging: boolean
}

type WbsItemProps = {
  node: WbsItemRow
  depth: number
  costMap: Record<string, WbsCostResult>
  parentCode: string | null
  canEdit: boolean
  onEdit: (node: WbsItemRow) => void
  onDelete: (node: WbsItemRow) => void
  onAddChild: (parent: WbsItemRow) => void
  onInlineUpdate?: (nodeId: string, data: { name?: string; estimatedDuration?: number | null }) => void
  sortableProps?: SortableProps
  renderChildren?: (children: WbsItemRow[]) => React.ReactNode
}

function WbsItemVarianceBadge({ status }: { status: 'under' | 'on_track' | 'over' }) {
  const variant = status === 'under' ? 'under' : status === 'over' ? 'over' : 'track'
  const labels = { under: 'Under', on_track: 'On track', over: 'Over' }
  return <Badge variant={variant}>{labels[status]}</Badge>
}

export function WbsItem({
  node,
  depth,
  costMap,
  parentCode,
  canEdit,
  onEdit,
  onDelete,
  onAddChild,
  onInlineUpdate,
  sortableProps,
  renderChildren,
}: WbsItemProps) {
  const costs = costMap[node.id] ?? null
  const hasChildren = node.children.length > 0
  const canHaveChildren = node.category !== 'TASK'

  const [editingField, setEditingField] = useState<'name' | 'quantity' | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (editingField) {
      inputRef.current?.focus()
    }
  }, [editingField])

  function startEditName() {
    if (!canEdit || !onInlineUpdate) return
    setEditValue(node.name)
    setEditingField('name')
  }

  function startEditQuantity() {
    if (!canEdit || !onInlineUpdate) return
    const qty = node.quantity != null ? String(Number(node.quantity)) : ''
    setEditValue(qty)
    setEditingField('quantity')
  }

  function commitEdit() {
    if (!onInlineUpdate || !editingField) return
    if (editingField === 'name') {
      const trimmed = editValue.trim()
      if (trimmed && trimmed !== node.name) {
        onInlineUpdate(node.id, { name: trimmed })
      }
    } else if (editingField === 'quantity') {
      const parsed = editValue === '' ? null : parseFloat(editValue)
      const prev = node.quantity != null ? Number(node.quantity) : null
      if (parsed !== prev && (parsed === null || !Number.isNaN(parsed))) {
        onInlineUpdate(node.id, { estimatedDuration: parsed })
      }
    }
    setEditingField(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingField(null)
  }

  const rowContent = (
    <>
      {sortableProps && canEdit && (
        <span
          className="cursor-grab touch-none shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
          {...sortableProps.listeners}
          {...sortableProps.attributes}
          title="Drag to reorder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
          </svg>
        </span>
      )}
      {hasChildren && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? (
            <IconChevronDown size="sm" />
          ) : (
            <IconChevronRight size="sm" />
          )}
        </button>
      )}
      {!hasChildren && <span className="w-4 shrink-0" />}
      <span className="w-20 shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
        {node.code}
      </span>
      {editingField === 'name' ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="h-8 min-w-[120px] max-w-[200px]"
        />
      ) : (
        <span
          className={cn(
            'min-w-0 flex-1 font-medium text-foreground',
            canEdit && onInlineUpdate && 'cursor-pointer rounded px-1 py-0.5 hover:bg-muted'
          )}
          onClick={canEdit && onInlineUpdate ? startEditName : undefined}
          onDoubleClick={canEdit && onInlineUpdate ? startEditName : undefined}
          title={canEdit && onInlineUpdate ? 'Double-click to edit' : undefined}
        >
          {node.name}
        </span>
      )}
      <span className="w-20 shrink-0 rounded bg-muted px-2 py-0.5 text-muted-foreground">
        {node.category}
      </span>
      <span className="w-16 shrink-0 text-muted-foreground">
        {parentCode ?? '—'}
      </span>
      {editingField === 'quantity' ? (
        <Input
          ref={inputRef}
          type="number"
          numeric
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="h-8 w-20"
        />
      ) : (
        <span
          className={cn(
            'w-24 shrink-0 text-right font-mono tabular-nums text-muted-foreground',
            canEdit && onInlineUpdate && 'cursor-pointer rounded px-1 py-0.5 hover:bg-muted'
          )}
          onClick={canEdit && onInlineUpdate ? startEditQuantity : undefined}
          onDoubleClick={canEdit && onInlineUpdate ? startEditQuantity : undefined}
          title={canEdit && onInlineUpdate ? 'Double-click to edit' : undefined}
        >
          {node.quantity != null ? String(Number(node.quantity)) : '—'}
        </span>
      )}
      <span className="w-24 shrink-0 text-right font-mono tabular-nums text-muted-foreground">
        {costs ? formatCurrency(costs.actualTotal) : '—'}
      </span>
      <span className="w-20 shrink-0">
        {costs && costs.estimatedTotal > 0 ? (
          <WbsItemVarianceBadge status={costs.varianceStatus} />
        ) : (
          '—'
        )}
      </span>
      {canEdit && (
        <span className="flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(node)}>
            Edit
          </Button>
          {canHaveChildren && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onAddChild(node)}>
              Add child
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(node)}
          >
            Delete
          </Button>
        </span>
      )}
    </>
  )

  const inner = (
    <div
      className={cn(
        'wbs-item flex flex-wrap items-center gap-2 py-2 pr-2 text-sm transition-opacity duration-200',
        sortableProps?.isDragging && 'opacity-50'
      )}
      data-level={Math.min(depth, 4)}
    >
      {rowContent}
    </div>
  )

  const wrappedRow = sortableProps ? (
    <div
      ref={sortableProps.setNodeRef}
      style={sortableProps.style}
      className="border-b border-border"
    >
      {inner}
    </div>
  ) : (
    <div className="border-b border-border">
      {inner}
    </div>
  )

  const childrenContent =
    hasChildren && expanded
      ? renderChildren
        ? renderChildren(node.children)
        : node.children.map((child) => (
            <WbsItem
              key={child.id}
              node={child}
              depth={depth + 1}
              costMap={costMap}
              parentCode={node.code}
              canEdit={canEdit}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onInlineUpdate={onInlineUpdate}
            />
          ))
      : null

  return (
    <>
      {wrappedRow}
      {childrenContent && (
        <div className="transition-opacity duration-200 ease-out">
          {childrenContent}
        </div>
      )}
    </>
  )
}
