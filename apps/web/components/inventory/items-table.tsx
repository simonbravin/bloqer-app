'use client'

import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'

interface ItemsTableProps {
  items: Array<{
    id: string
    sku: string
    name: string
    description?: string | null
    category: { id: string; name: string }
    subcategory?: { id: string; name: string } | null
    unit: string
    minStockQty?: unknown
    reorderQty?: unknown
    current_stock: unknown
    last_purchase_cost?: unknown
  }>
}

function toNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  return (v as { toNumber?: () => number })?.toNumber?.() ?? 0
}

function getStockStatus(currentStock: number, minStock: number | null) {
  if (!minStock) return { label: 'OK', variant: 'neutral' as const }
  if (currentStock === 0) return { label: 'Sin Stock', variant: 'danger' as const }
  if (currentStock < minStock) return { label: 'Stock Bajo', variant: 'warning' as const }
  return { label: 'OK', variant: 'success' as const }
}

export function ItemsTable({ items }: ItemsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Nombre</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Categoría</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Stock Actual</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Stock Mín.</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Último Costo</th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const currentStock = toNum(item.current_stock)
            const minStock = item.minStockQty != null ? toNum(item.minStockQty) : null
            const status = getStockStatus(currentStock, minStock)

            return (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-sm">{item.sku}</td>
                <td className="px-4 py-3">
                  <Link href={`/inventory/items/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description.substring(0, 50)}
                      {item.description.length > 50 && '...'}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {item.category.name}
                  {item.subcategory ? ` / ${item.subcategory.name}` : ''}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                  {currentStock.toFixed(2)} {item.unit}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                  {item.minStockQty != null ? `${toNum(item.minStockQty).toFixed(2)} ${item.unit}` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm tabular-nums">
                  {item.last_purchase_cost != null ? formatCurrency(toNum(item.last_purchase_cost)) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/items/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/inventory/items/${item.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
