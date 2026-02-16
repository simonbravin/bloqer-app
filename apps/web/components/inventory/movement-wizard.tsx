'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowRightLeft, Minus, Plus } from 'lucide-react'
import { PurchaseForm } from './movement-forms/purchase-form'
import { TransferForm } from './movement-forms/transfer-form'
import { IssueForm } from './movement-forms/issue-form'
import { AdjustmentForm } from './movement-forms/adjustment-form'

interface MovementWizardProps {
  items: Array<{
    id: string
    sku: string
    name: string
    unit: string
    category?: string
  }>
  locations: Array<{ id: string; name: string; type: string }>
  projects: Array<{ id: string; projectNumber: string; name: string }>
  suppliers: Array<{ id: string; name: string }>
  initialType?: string
  initialItemId?: string
}

const movementTypes = [
  {
    type: 'PURCHASE',
    label: 'Compra',
    description: 'Registrar compra de material a proveedor',
    icon: ShoppingCart,
    color: 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    type: 'TRANSFER',
    label: 'Transferencia',
    description: 'Mover stock entre ubicaciones',
    icon: ArrowRightLeft,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    type: 'ISSUE',
    label: 'Consumo',
    description: 'Consumir material en proyecto (carga a WBS)',
    icon: Minus,
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    type: 'ADJUSTMENT',
    label: 'Ajuste',
    description: 'Ajustar stock por diferencia de inventario',
    icon: Plus,
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
]

export function MovementWizard({
  items,
  locations,
  projects,
  suppliers,
  initialType,
  initialItemId,
}: MovementWizardProps) {
  const [selectedType, setSelectedType] = useState<string | null>(
    initialType ?? null
  )

  if (!selectedType) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">
            Selecciona el tipo de movimiento
          </h3>
          <p className="text-sm text-muted-foreground">
            Elige la operación que deseas realizar con el inventario
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {movementTypes.map((type) => {
            const Icon = type.icon

            return (
              <button
                key={type.type}
                type="button"
                onClick={() => setSelectedType(type.type)}
                className={`rounded-lg border-2 p-6 text-left transition-all ${type.color}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-lg bg-white p-3 dark:bg-gray-900 ${type.iconColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{type.label}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const selectedTypeInfo = movementTypes.find((t) => t.type === selectedType)
  const Icon = selectedTypeInfo?.icon ?? ShoppingCart

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-lg bg-white p-3 dark:bg-gray-900 ${selectedTypeInfo?.iconColor ?? ''}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {selectedTypeInfo?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedTypeInfo?.description}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSelectedType(null)}
          >
            Cambiar Tipo
          </Button>
        </div>
      </Card>

      {selectedType === 'PURCHASE' && (
        <PurchaseForm
          items={items}
          locations={locations}
          projects={projects}
          suppliers={suppliers}
          initialItemId={initialItemId}
        />
      )}

      {selectedType === 'TRANSFER' && (
        <TransferForm
          items={items}
          locations={locations}
          initialItemId={initialItemId}
        />
      )}

      {selectedType === 'ISSUE' && (
        <IssueForm
          items={items}
          locations={locations.filter((l) => l.type === 'PROJECT_SITE')}
          projects={projects}
          initialItemId={initialItemId}
        />
      )}

      {selectedType === 'ADJUSTMENT' && (
        <AdjustmentForm
          items={items}
          locations={locations}
          initialItemId={initialItemId}
        />
      )}
    </div>
  )
}
