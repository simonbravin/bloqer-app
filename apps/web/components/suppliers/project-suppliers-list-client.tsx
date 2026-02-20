'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { List, Grid3x3 } from 'lucide-react'

export type ProjectSupplierItem = {
  name: string
  email?: string | null
  phone?: string | null
  city?: string | null
}

interface ProjectSuppliersListClientProps {
  items: ProjectSupplierItem[]
}

export function ProjectSuppliersListClient({ items }: ProjectSuppliersListClientProps) {
  const t = useTranslations('suppliers')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay proveedores asociados a este proyecto aún (transacciones o presupuesto).
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant={viewMode === 'table' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          <List className="mr-2 h-4 w-4" />
          {t('table')}
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          <Grid3x3 className="mr-2 h-4 w-4" />
          {t('cards')}
        </Button>
      </div>

      {viewMode === 'table' ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('city')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.email ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.phone ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.city ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.name}>
              <CardContent className="p-4">
                <p className="font-semibold text-foreground">{item.name}</p>
                <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {item.email && (
                    <div>
                      <dt className="sr-only">{t('email')}</dt>
                      <dd>{item.email}</dd>
                    </div>
                  )}
                  {item.phone && (
                    <div>
                      <dt className="sr-only">{t('phone')}</dt>
                      <dd>{item.phone}</dd>
                    </div>
                  )}
                  {item.city && (
                    <div>
                      <dt className="sr-only">{t('city')}</dt>
                      <dd>{item.city}</dd>
                    </div>
                  )}
                  {!item.email && !item.phone && !item.city && (
                    <dd>—</dd>
                  )}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
