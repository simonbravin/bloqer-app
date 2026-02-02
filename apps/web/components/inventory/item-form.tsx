'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createInventoryItemSchema,
  type CreateInventoryItemInput,
} from '@repo/validators'
import { createInventoryItem, updateInventoryItem } from '@/app/actions/inventory'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InventoryItem } from '@repo/database'

interface ItemFormProps {
  item?: InventoryItem
}

const CATEGORIES = [
  { value: 'MATERIAL', label: 'Material' },
  { value: 'LABOR', label: 'Mano de Obra' },
  { value: 'EQUIPMENT', label: 'Equipo' },
  { value: 'SUBCONTRACT', label: 'Subcontrato' },
  { value: 'OTHER', label: 'Otro' },
] as const

const UNITS = [
  { value: 'un', label: 'Unidad (un)' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'm', label: 'Metro (m)' },
  { value: 'm2', label: 'Metro Cuadrado (m²)' },
  { value: 'm3', label: 'Metro Cúbico (m³)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'caja', label: 'Caja' },
  { value: 'ton', label: 'Tonelada (ton)' },
]

function toNum(v: unknown): number | undefined {
  if (v == null) return undefined
  if (typeof v === 'number') return v
  const n = (v as { toNumber?: () => number })?.toNumber?.()
  return n != null ? n : undefined
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInventoryItemInput>({
    resolver: zodResolver(createInventoryItemSchema),
    defaultValues: item
      ? {
          sku: item.sku,
          name: item.name,
          description: item.description ?? '',
          category: item.category,
          unit: item.unit,
          minStockQty: toNum(item.minStockQty),
          reorderQty: toNum(item.reorderQty),
        }
      : {
          category: 'MATERIAL',
          unit: 'un',
        },
  })

  async function onSubmit(data: CreateInventoryItemInput) {
    setIsSubmitting(true)
    try {
      const result = item
        ? await updateInventoryItem(item.id, data)
        : await createInventoryItem(data)

      if (result.success) {
        toast.success(item ? 'Item actualizado' : 'Item creado correctamente')
        router.push('/inventory/items')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Error al guardar')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Información Básica</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              placeholder="MAT-001"
              {...register('sku')}
              className="mt-1 font-mono"
            />
            {errors.sku && (
              <p className="mt-1 text-xs text-destructive">{errors.sku.message}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Código único del item
            </p>
          </div>

          <div>
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              {...register('category')}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Cemento Portland Tipo I - 50kg"
              {...register('name')}
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción detallada del item..."
              {...register('description')}
              rows={3}
              className="mt-1"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Unidad y Stock</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="unit">Unidad de Medida *</Label>
            <select
              id="unit"
              {...register('unit')}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className="mt-1 text-xs text-destructive">
                {errors.unit.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="minStockQty">Stock Mínimo</Label>
            <Input
              id="minStockQty"
              type="number"
              step="0.01"
              placeholder="10.00"
              {...register('minStockQty', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.minStockQty && (
              <p className="mt-1 text-xs text-destructive">
                {errors.minStockQty.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Alerta cuando stock baje de este valor
            </p>
          </div>

          <div>
            <Label htmlFor="reorderQty">Cantidad de Reposición</Label>
            <Input
              id="reorderQty"
              type="number"
              step="0.01"
              placeholder="50.00"
              {...register('reorderQty', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.reorderQty && (
              <p className="mt-1 text-xs text-destructive">
                {errors.reorderQty.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Cantidad sugerida para comprar
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : item
              ? 'Actualizar Item'
              : 'Crear Item'}
        </Button>
      </div>
    </form>
  )
}
