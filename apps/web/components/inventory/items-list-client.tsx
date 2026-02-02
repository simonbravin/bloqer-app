'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Grid3x3, List, Package } from 'lucide-react'
import { ItemsTable } from './items-table'
import { ItemsGrid } from './items-grid'
import { Link } from '@/i18n/navigation'

interface ItemRow {
  id: string
  sku: string
  name: string
  description?: string | null
  category: string
  unit: string
  minStockQty?: unknown
  reorderQty?: unknown
  current_stock: unknown
  last_purchase_cost?: unknown
  last_movement_date?: Date | null
}

interface ItemsListClientProps {
  items: ItemRow[]
  categories: (string | null)[]
}

export function ItemsListClient({ items, categories }: ItemsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '')
  const [stockFilter, setStockFilter] = useState(searchParams.get('stock') ?? '')

  function handleSearch() {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (selectedCategory) params.set('category', selectedCategory)
    if (stockFilter) params.set('stock', stockFilter)
    router.push(`/inventory/items?${params.toString()}`)
  }

  function handleClearFilters() {
    setSearch('')
    setSelectedCategory('')
    setStockFilter('')
    router.push('/inventory/items')
  }

  const categoryOptions = categories.filter((c): c is string => c != null && c !== '')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por SKU o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="mb-2 block text-sm font-medium">Categoría</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="mb-2 block text-sm font-medium">Estado stock</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="ok">Stock OK</option>
            <option value="low">Stock Bajo</option>
            <option value="zero">Sin Stock</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch}>Filtrar</Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="mr-2 h-4 w-4" />
            Tabla
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="mr-2 h-4 w-4" />
            Tarjetas
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No se encontraron items</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/inventory/items/new">Crear Primer Item</Link>
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <ItemsTable items={items} />
      ) : (
        <ItemsGrid items={items} />
      )}
    </div>
  )
}
