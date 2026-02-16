'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, Globe } from 'lucide-react'

interface SuppliersKPICardsProps {
  totalLinked: number
  totalLocal: number
}

export function SuppliersKPICards({
  totalLinked,
  totalLocal,
}: SuppliersKPICardsProps) {
  const t = useTranslations('suppliers')
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('totalLinked')}</p>
            <p className="text-2xl font-semibold tabular-nums">{totalLinked}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('totalLocal')}</p>
            <p className="text-2xl font-semibold tabular-nums">{totalLocal}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('totalSuppliers')}</p>
            <p className="text-2xl font-semibold tabular-nums">{totalLinked + totalLocal}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
