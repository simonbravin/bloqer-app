'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SupplierSearch } from './supplier-search'

type LinkedSupplier = {
  id: string
  localAlias: string | null
  preferred: boolean
  localContactName: string | null
  globalParty: {
    id: string
    name: string
    category: string
    verified: boolean
  }
}

type LocalSupplier = {
  id: string
  name: string
  email: string | null
  phone: string | null
  city: string | null
}

type GlobalParty = {
  id: string
  name: string
  category: string
  description: string | null
  verified: boolean
  avgRating: unknown
  reviewCount: number
  orgCount: number
  countries: string[]
  regions: string[]
}

type SuppliersPageClientProps = {
  defaultTab: string
  linkedSuppliers: LinkedSupplier[]
  localSuppliers: LocalSupplier[]
  globalSearchResults: GlobalParty[]
  canAddLocal: boolean
}

export function SuppliersPageClient({
  defaultTab,
  linkedSuppliers,
  localSuppliers,
  globalSearchResults,
}: SuppliersPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/suppliers?${params.toString()}`)
  }

  return (
    <Tabs value={defaultTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="linked">
          My Suppliers ({linkedSuppliers.length})
        </TabsTrigger>
        <TabsTrigger value="local">Local ({localSuppliers.length})</TabsTrigger>
        <TabsTrigger value="directory">Global Directory</TabsTrigger>
      </TabsList>

      <TabsContent value="linked">
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {linkedSuppliers.length === 0 ? (
            <p className="col-span-full text-sm text-gray-500">
              No linked suppliers yet. Browse the Global Directory to link
              suppliers.
            </p>
          ) : (
            linkedSuppliers.map((link) => (
              <div
                key={link.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {link.localAlias || link.globalParty.name}
                    </h3>
                    {link.globalParty.verified && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {link.preferred && (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs dark:bg-yellow-900/30">
                      Preferred
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {link.globalParty.category.replace(/_/g, ' ')}
                </p>
                {link.localContactName && (
                  <p className="mt-1 text-sm">Contact: {link.localContactName}</p>
                )}
                <Link
                  href={`/suppliers/global/${link.globalParty.id}`}
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Details →
                </Link>
              </div>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="local">
        <div className="mt-4">
          {localSuppliers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No local suppliers. Add one to get started.
            </p>
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">Phone</th>
                    <th className="px-3 py-2 text-left font-medium">City</th>
                  </tr>
                </thead>
                <tbody>
                  {localSuppliers.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {s.email ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {s.phone ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                        {s.city ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="directory">
        <div className="mt-4">
          <SupplierSearch
            key={searchParams.get('q') ?? 'default'}
            initialResults={globalSearchResults}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
