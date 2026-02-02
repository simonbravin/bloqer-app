'use client'

import { Card } from '@/components/ui/card'
import { Warehouse, Building2 } from 'lucide-react'

interface ItemStockByLocationProps {
  stockByLocation: Array<{
    id: string
    name: string
    type: string
    stock: number
  }>
  totalStock: number
  unit: string
}

const locationIcons: Record<string, typeof Warehouse> = {
  CENTRAL_WAREHOUSE: Warehouse,
  PROJECT_SITE: Building2,
  SUPPLIER: Building2,
}

export function ItemStockByLocation({
  stockByLocation,
  totalStock,
  unit,
}: ItemStockByLocationProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Stock por Ubicación</h3>

      {stockByLocation.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay stock en ninguna ubicación
        </p>
      ) : (
        <div className="space-y-4">
          {stockByLocation.map((location) => {
            const stock = location.stock
            const percentage = totalStock > 0 ? (stock / totalStock) * 100 : 0
            const Icon = locationIcons[location.type] ?? Warehouse

            return (
              <div key={location.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location.name}</span>
                  </div>
                  <span className="font-mono text-sm tabular-nums">
                    {stock.toFixed(2)} {unit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% del stock total
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
