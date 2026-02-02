import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/format-utils'

type ItemRow = {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  minStockQty: { toNumber?: () => number } | number | null
  reorderQty: { toNumber?: () => number } | number | null
  currentStock: { toNumber?: () => number } | number
  status: 'ok' | 'low' | 'out'
}

type ItemListProps = {
  items: ItemRow[]
}

function toNum(v: ItemRow['currentStock']): number {
  if (typeof v === 'number') return v
  return v?.toNumber?.() ?? 0
}

function minToNum(v: ItemRow['minStockQty']): number | null {
  if (v == null) return null
  return typeof v === 'number' ? v : v?.toNumber?.() ?? null
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  ok: 'success',
  low: 'warning',
  out: 'danger',
}

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  low: 'Low stock',
  out: 'Out of stock',
}

export function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="erp-card border-dashed p-8 text-center text-muted-foreground">
        No inventory items. Create one to get started.
      </div>
    )
  }

  return (
    <div className="erp-card overflow-hidden">
      <table className="erp-table w-full text-sm">
        <thead>
          <tr className="erp-table-header">
            <th className="erp-table-cell font-medium text-muted-foreground">Code</th>
            <th className="erp-table-cell font-medium text-muted-foreground">Name</th>
            <th className="erp-table-cell font-medium text-muted-foreground">Category</th>
            <th className="erp-table-cell font-medium text-muted-foreground">Unit</th>
            <th className="erp-table-cell-numeric font-medium text-muted-foreground">Stock</th>
            <th className="erp-table-cell-numeric font-medium text-muted-foreground">Min</th>
            <th className="erp-table-cell font-medium text-center text-muted-foreground">Status</th>
            <th className="erp-table-cell font-medium text-right text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const stock = toNum(item.currentStock)
            const min = minToNum(item.minStockQty)
            return (
              <tr key={item.id} className="erp-table-row">
                <td className="erp-table-cell font-mono text-foreground">{item.sku}</td>
                <td className="erp-table-cell font-medium text-foreground">{item.name}</td>
                <td className="erp-table-cell text-muted-foreground">
                  {item.category.replace(/_/g, ' ')}
                </td>
                <td className="erp-table-cell text-muted-foreground">{item.unit}</td>
                <td className="erp-table-cell-numeric text-foreground">
                  {formatNumber(stock)}
                </td>
                <td className="erp-table-cell-numeric text-muted-foreground">
                  {min != null ? formatNumber(min) : '—'}
                </td>
                <td className="erp-table-cell text-center">
                  <Badge variant={STATUS_VARIANT[item.status]}>
                    {STATUS_LABEL[item.status]}
                  </Badge>
                </td>
                <td className="erp-table-cell text-right">
                  <Link href={`/inventory/items/${item.id}`}>
                    <Button type="button" variant="ghost" className="h-8 px-2 text-xs">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
