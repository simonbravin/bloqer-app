'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { ResourceList } from './resource-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deactivateResource } from '@/app/actions/resources'
import type { ListResourcesResult } from '@/app/actions/resources'
import { RESOURCE_CATEGORY } from '@repo/validators'

type ResourcesPageClientProps = {
  initialData: ListResourcesResult
  canEdit: boolean
}

export function ResourcesPageClient({ initialData, canEdit }: ResourcesPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')

  function applyFilters() {
    const p = new URLSearchParams()
    if (search.trim()) p.set('search', search.trim())
    if (category) p.set('category', category)
    router.push(`/resources?${p.toString()}`)
    router.refresh()
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this resource? It will no longer appear in the catalog.')) return
    await deactivateResource(id)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Resource catalog
        </h1>
        {canEdit && (
          <Link href="/resources/new">
            <Button type="button">Add resource</Button>
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        <Input
          type="search"
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="max-w-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">All categories</option>
          {RESOURCE_CATEGORY.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={applyFilters}>
          Apply
        </Button>
      </div>
      <ResourceList data={initialData} canEdit={canEdit} onDeactivate={handleDeactivate} />
    </div>
  )
}
