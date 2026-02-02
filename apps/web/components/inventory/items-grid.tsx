'use client'

import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-utils'
import { Package, Edit, Eye } from 'lucide-react'

interface ItemsGridProps {
  items: Array<{
    id: string
    sku: string
    name: string
    category: string
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
  if (!minStock) return { label: 'OK', variant: 'neutral' as const, percent: 100 }
  if (currentStock === 0) return { label: 'Sin Stock', variant: 'danger' as const, percent: 0 }
  const percent = (currentStock / (minStock * 2)) * 100
  if (currentStock < minStock) {
    return { label: 'Stock Bajo', variant: 'warning' as const, percent: Math.min(percent, 100) }
  }
  return { label: 'OK', variant: 'success' as const, percent: Math.min(percent, 100) }
}

export function ItemsGrid({ items }: ItemsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const currentStock = toNum(item.current_stock)
        const minStock = item.minStockQty != null ? toNum(item.minStockQty) : null
        const status = getStockStatus(currentStock, minStock)

        return (
          <Card key={item.id} className="overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-muted">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>

            <div className="p-4">
              <div className="mb-3">
                <div className="mb-1 flex items-start justify-between">
                  <Link href={`/inventory/items/${item.id}`} className="font-semibold hover:underline">
                    {item.name}
                  </Link>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">SKU: {item.sku}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-mono tabular-nums">
                    {currentStock.toFixed(2)} {item.unit}
                  </span>
                </div>
                {item.minStockQty != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mínimo:</span>
                    <span className="font-mono tabular-nums">{toNum(item.minStockQty).toFixed(2)} {item.unit}</span>
                  </div>
                )}
                {item.last_purchase_cost != null && toNum(item.last_purchase_cost) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último Costo:</span>
                    <span className="font-mono tabular-nums">{formatCurrency(toNum(item.last_purchase_cost))}</span>
                  </div>
                )}
                {item.minStockQty != null && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Nivel de Stock</span>
                      <span>{Math.round(status.percent)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${status.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/inventory/items/${item.id}`}>
                    <Eye className="mr-1 h-3 w-3" />
                    Ver
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/inventory/items/${item.id}/edit`}>
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
