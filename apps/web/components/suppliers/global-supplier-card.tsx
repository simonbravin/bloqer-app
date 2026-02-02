'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type GlobalSupplier = {
  id: string
  name: string
  category: string
  description?: string | null
  verified?: boolean
  avgRating?: unknown
  reviewCount?: number
  orgCount?: number
  countries?: string[]
  regions?: string[]
}

type GlobalSupplierCardProps = {
  supplier: GlobalSupplier
  compact?: boolean
}

function formatRating(r: unknown): string {
  if (r == null) return ''
  const n = typeof r === 'number' ? r : (r as { toNumber?: () => number }).toNumber?.() ?? 0
  return n > 0 ? n.toFixed(1) : ''
}

export function GlobalSupplierCard({
  supplier,
  compact = false,
}: GlobalSupplierCardProps) {
  const rating = formatRating(supplier.avgRating)
  const countries = supplier.countries?.join(', ') ?? ''
  const reviewCount = supplier.reviewCount ?? 0

  if (compact) {
    return (
      <Link href={`/suppliers/global/${supplier.id}`}>
        <Card className="h-full p-4 transition-colors hover:bg-muted/50 hover:border-accent/50">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-foreground">{supplier.name}</h3>
                {supplier.verified && (
                  <span className="text-xs text-status-info">✓ Verified</span>
                )}
              </div>
              {rating && (
                <span className="text-sm text-muted-foreground">
                  ⭐ {rating}
                  {reviewCount > 0 && ` (${reviewCount})`}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {supplier.category.replace(/_/g, ' ')}
            </p>
            {countries && (
              <p className="mt-1 text-xs text-muted-foreground">📍 {countries}</p>
            )}
            <span className="mt-2 inline-block text-sm text-accent hover:underline">
              View Details →
            </span>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-foreground">{supplier.name}</h3>
            {supplier.verified && (
              <span className="text-xs text-status-info">✓ Verified</span>
            )}
          </div>
          {rating && (
            <span className="text-sm text-muted-foreground">
              ⭐ {rating}
              {reviewCount > 0 && ` (${reviewCount})`}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {supplier.category.replace(/_/g, ' ')}
        </p>
        {countries && (
          <p className="mt-1 text-xs text-muted-foreground">📍 {countries}</p>
        )}
        <Link href={`/suppliers/global/${supplier.id}`} className="mt-3 block">
          <Button type="button" variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
