'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrencyForDisplay } from '@/lib/format-utils'
import { Package, AlertTriangle, DollarSign, Activity } from 'lucide-react'

interface InventoryKPICardsProps {
  totalItems: number
  criticalStock: number
  totalValue: number
  monthMovements: number
}

export function InventoryKPICards({
  totalItems,
  criticalStock,
  totalValue,
  monthMovements,
}: InventoryKPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Items activos</p>
            <p className="text-2xl font-semibold tabular-nums">{totalItems}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              criticalStock > 0 ? 'bg-status-warning/20 text-status-warning' : 'bg-muted text-muted-foreground'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stock crítico</p>
            <p className="text-2xl font-semibold tabular-nums">{criticalStock}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Valor inventario</p>
            <p className="text-2xl font-semibold tabular-nums erp-kpi-value">{formatCurrencyForDisplay(totalValue)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Movimientos (mes)</p>
            <p className="text-2xl font-semibold tabular-nums">{monthMovements}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
