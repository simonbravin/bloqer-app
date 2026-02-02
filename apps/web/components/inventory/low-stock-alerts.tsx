'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { AlertTriangle } from 'lucide-react'

type LowStockItem = {
  id: string
  sku: string
  name: string
  unit: string
  minStockQty: unknown
  reorderQty: unknown
  current_stock: unknown
}

interface LowStockAlertsProps {
  items: LowStockItem[]
}

function toNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  if (typeof v === 'object' && v !== null && 'toNumber' in v && typeof (v as { toNumber: () => number }).toNumber === 'function') {
    return (v as { toNumber: () => number }).toNumber()
  }
  return Number(v)
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Stock bajo</CardTitle>
        {items.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link href="/inventory/items?stock=low">Ver todos</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
            <AlertTriangle className="mb-2 h-8 w-8 opacity-50" />
            <p>No hay items con stock por debajo del mínimo</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const current = toNum(item.current_stock)
              const min = toNum(item.minStockQty)
              return (
                <li key={item.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums text-foreground">
                      {current.toFixed(2)} / {min.toFixed(2)} {item.unit}
                    </p>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                      <Link href={`/inventory/items/${item.id}`}>Ver detalle</Link>
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
