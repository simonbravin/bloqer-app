'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format-utils'
import { Hash, Tag, Ruler, AlertTriangle } from 'lucide-react'

interface ItemDetailInfoProps {
  item: {
    sku: string
    name: string
    category: { id: string; name: string }
    subcategory?: { id: string; name: string } | null
    unit: string
    description?: string | null
    minStockQty?: unknown
    reorderQty?: unknown
    last_purchase_cost?: unknown
    current_stock: unknown
  }
}

function toNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  return (v as { toNumber?: () => number })?.toNumber?.() ?? 0
}

export function ItemDetailInfo({ item }: ItemDetailInfoProps) {
  const currentStock = toNum(item.current_stock)
  const minStock = item.minStockQty != null ? toNum(item.minStockQty) : null
  const isLowStock = minStock != null && currentStock < minStock
  const isOutOfStock = currentStock === 0

  return (
    <Card className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Información General</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Hash className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-mono font-medium">{item.sku}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">
                  {item.category.name}
                  {item.subcategory ? ` / ${item.subcategory.name}` : ''}
                </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ruler className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Unidad de Medida</p>
                  <p className="font-medium">{item.unit}</p>
                </div>
              </div>

              {item.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="mt-1 text-sm">{item.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Stock y Costos</h3>

            <div className="space-y-3">
              {/* Current Stock */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock Actual</span>
                  {isOutOfStock && <Badge variant="danger">Sin Stock</Badge>}
                  {isLowStock && !isOutOfStock && (
                    <Badge variant="warning">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Stock Bajo
                    </Badge>
                  )}
                </div>
                <p className="mt-2 font-mono text-2xl font-bold tabular-nums">
                  {currentStock.toFixed(2)} {item.unit}
                </p>
              </div>

              {/* Min Stock */}
              {minStock != null && (
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Stock Mínimo</span>
                  <span className="font-mono text-sm tabular-nums">
                    {minStock.toFixed(2)} {item.unit}
                  </span>
                </div>
              )}

              {/* Reorder Qty */}
              {item.reorderQty != null && (
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Cantidad de Reposición</span>
                  <span className="font-mono text-sm tabular-nums">
                    {toNum(item.reorderQty).toFixed(2)} {item.unit}
                  </span>
                </div>
              )}

              {/* Last Purchase Cost */}
              {item.last_purchase_cost != null && toNum(item.last_purchase_cost) > 0 && (
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground">Último Costo de Compra</span>
                  <span className="font-mono text-sm tabular-nums">
                    {formatCurrency(toNum(item.last_purchase_cost))} / {item.unit}
                  </span>
                </div>
              )}

              {/* Total Value */}
              {item.last_purchase_cost != null && toNum(item.last_purchase_cost) > 0 && (
                <div className="rounded-lg bg-primary/5 p-3">
                  <span className="text-sm text-muted-foreground">Valor Total en Stock</span>
                  <p className="mt-1 font-mono text-xl font-bold tabular-nums">
                    {formatCurrency(currentStock * toNum(item.last_purchase_cost))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
