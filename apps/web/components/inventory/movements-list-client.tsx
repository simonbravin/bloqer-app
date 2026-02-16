'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '@/lib/format-utils'
import {
  ShoppingCart,
  ArrowRightLeft,
  Minus,
  Plus,
  ArrowRight,
  Filter,
  X,
} from 'lucide-react'

interface MovementsListClientProps {
  movements: Array<{
    id: string
    movementType: string
    quantity: unknown
    unitCost: unknown
    createdAt: Date
    item: { sku: string; name: string; unit: string }
    fromLocation?: { name: string; type: string } | null
    toLocation?: { name: string; type: string } | null
    project?: { projectNumber: string; name: string } | null
    wbsNode?: { code: string; name: string } | null
    createdBy?: { user?: { fullName: string } } | null
  }>
  items: Array<{ id: string; sku: string; name: string }>
  locations: Array<{ id: string; name: string }>
}

const movementTypes: Record<
  string,
  { label: string; icon: typeof ShoppingCart; variant: 'success' | 'info' | 'warning' | 'neutral' }
> = {
  PURCHASE: { label: 'Compra', icon: ShoppingCart, variant: 'success' },
  TRANSFER: { label: 'Transferencia', icon: ArrowRightLeft, variant: 'info' },
  ISSUE: { label: 'Consumo', icon: Minus, variant: 'warning' },
  ADJUSTMENT: { label: 'Ajuste', icon: Plus, variant: 'neutral' },
}

function toNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  return (v as { toNumber?: () => number })?.toNumber?.() ?? 0
}

export function MovementsListClient({
  movements,
  items,
  locations,
}: MovementsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    type: searchParams.get('type') ?? '',
    itemId: searchParams.get('itemId') ?? '',
    locationId: searchParams.get('locationId') ?? '',
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
  })

  function handleApplyFilters() {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    router.push(`/inventory/movements?${params.toString()}`)
  }

  function handleClearFilters() {
    setFilters({
      type: '',
      itemId: '',
      locationId: '',
      from: '',
      to: '',
    })
    router.push('/inventory/movements')
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {Object.values(filters).filter((v) => v !== '').length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Tipo de Movimiento
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-card dark:bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="PURCHASE">Compra</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="ISSUE">Consumo</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Item</label>
              <select
                value={filters.itemId}
                onChange={(e) =>
                  setFilters({ ...filters, itemId: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-card dark:bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Ubicación
              </label>
              <select
                value={filters.locationId}
                onChange={(e) =>
                  setFilters({ ...filters, locationId: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-card dark:bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters({ ...filters, to: e.target.value })
                }
              />
            </div>

            <div className="flex items-end md:col-span-2 lg:col-span-5">
              <Button onClick={handleApplyFilters} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-left text-sm">
                <th className="p-4 font-medium">Fecha</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Desde</th>
                <th className="p-4 font-medium"></th>
                <th className="p-4 font-medium">Hacia</th>
                <th className="p-4 text-right font-medium">Cantidad</th>
                <th className="p-4 text-right font-medium">Costo Unit.</th>
                <th className="p-4 text-right font-medium">Total</th>
                <th className="p-4 font-medium">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {movements.map((movement) => {
                const typeInfo =
                  movementTypes[movement.movementType] ?? movementTypes.ADJUSTMENT
                const Icon = typeInfo.icon
                const qty = toNum(movement.quantity)
                const unitCost = toNum(movement.unitCost)
                const totalCost = qty * unitCost

                return (
                  <tr
                    key={movement.id}
                    className="text-sm hover:bg-muted/30"
                  >
                    <td className="p-4 text-muted-foreground">
                      {formatDistanceToNow(new Date(movement.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </td>
                    <td className="p-4">
                      <Badge variant={typeInfo.variant} className="inline-flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {typeInfo.label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-medium">{movement.item.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {movement.item.sku}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      {movement.fromLocation?.name ?? '-'}
                    </td>
                    <td className="p-4">
                      <ArrowRight className="inline h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="p-4">
                      {movement.toLocation?.name ?? '-'}
                      {movement.project && (
                        <p className="text-xs text-muted-foreground">
                          {movement.project.projectNumber}
                        </p>
                      )}
                      {movement.wbsNode && (
                        <p className="text-xs text-muted-foreground">
                          {movement.wbsNode.code} - {movement.wbsNode.name}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {qty.toFixed(2)} {movement.item.unit}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums">
                      {unitCost > 0 ? formatCurrency(unitCost) : '-'}
                    </td>
                    <td className="p-4 text-right font-mono tabular-nums font-medium">
                      {unitCost > 0 ? formatCurrency(totalCost) : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {movement.createdBy?.user?.fullName ?? 'Sistema'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {movements.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron movimientos
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
