'use client'

import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateShort, formatNumber } from '@/lib/format-utils'

type MovementRow = {
  id: string
  movementType: string
  quantity: { toNumber?: () => number } | number
  unitCost: { toNumber?: () => number } | number
  totalCost: { toNumber?: () => number } | number
  createdAt: Date
  item: { id: string; sku: string; name: string }
  fromLocation?: { name: string } | null
  toLocation?: { name: string } | null
}

type MovementListProps = {
  movements: MovementRow[]
  showItem?: boolean
}

function toNum(v: unknown): number {
  if (typeof v === 'number') return v
  return (v as { toNumber?: () => number })?.toNumber?.() ?? 0
}

export function MovementList({ movements, showItem = true }: MovementListProps) {
  if (movements.length === 0) {
    return (
      <div className="erp-card border-dashed p-6 text-center text-muted-foreground">
        No movements yet.
      </div>
    )
  }

  return (
    <div className="erp-card overflow-hidden">
      <table className="erp-table w-full text-sm">
        <thead>
          <tr className="erp-table-header">
            {showItem && <th className="erp-table-cell font-medium text-muted-foreground">Item</th>}
            <th className="erp-table-cell font-medium text-muted-foreground">Type</th>
            <th className="erp-table-cell font-medium text-muted-foreground">From</th>
            <th className="erp-table-cell font-medium text-muted-foreground">To</th>
            <th className="erp-table-cell-numeric font-medium text-muted-foreground">Qty</th>
            <th className="erp-table-cell-numeric font-medium text-muted-foreground">Cost</th>
            <th className="erp-table-cell font-medium text-muted-foreground">Date</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id} className="erp-table-row">
              {showItem && (
                <td className="erp-table-cell">
                  <Link
                    href={`/inventory/items/${m.item?.id ?? m.id}`}
                    className="font-medium text-foreground underline hover:no-underline"
                  >
                    {m.item?.sku} {m.item?.name}
                  </Link>
                </td>
              )}
              <td className="erp-table-cell">
                <Badge variant="neutral">{m.movementType}</Badge>
              </td>
              <td className="erp-table-cell text-muted-foreground">{m.fromLocation?.name ?? '—'}</td>
              <td className="erp-table-cell text-muted-foreground">{m.toLocation?.name ?? '—'}</td>
              <td className="erp-table-cell-numeric text-foreground">
                {formatNumber(toNum(m.quantity))}
              </td>
              <td className="erp-table-cell-numeric text-foreground">
                {formatCurrency(toNum(m.totalCost))}
              </td>
              <td className="erp-table-cell font-mono tabular-nums text-muted-foreground">
                {formatDateShort(m.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
