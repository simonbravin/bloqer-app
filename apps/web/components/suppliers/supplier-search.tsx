'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { GlobalSupplierCard } from './global-supplier-card'

type GlobalParty = {
  id: string
  name: string
  category: string
  description: string | null
  verified: boolean
  avgRating?: unknown
  reviewCount?: number
  orgCount?: number
  countries?: string[]
  regions?: string[]
}

type SupplierSearchProps = {
  initialResults: GlobalParty[]
}

export function SupplierSearch({ initialResults }: SupplierSearchProps) {
  const t = useTranslations('suppliers')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    params.set('tab', 'directory')
    router.push(`/suppliers/list?${params.toString()}`)
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">{t('filter')}</Button>
      </form>

      {initialResults.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noDirectoryResults')}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialResults.map((supplier) => (
            <GlobalSupplierCard
              key={supplier.id}
              supplier={supplier}
              compact
            />
          ))}
        </div>
      )}
    </div>
  )
}
