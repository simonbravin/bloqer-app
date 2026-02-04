'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Play, Trash2, Copy, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CustomReportWithCreator } from '@/lib/types/reports'

interface CustomReportsListProps {
  reports: CustomReportWithCreator[]
}

export function CustomReportsList({ reports }: CustomReportsListProps) {
  const t = useTranslations('reports')

  const categoryColors: Record<string, string> = {
    BUDGET: 'bg-blue-100 text-blue-800',
    MATERIALS: 'bg-green-100 text-green-800',
    FINANCE: 'bg-purple-100 text-purple-800',
    CERTIFICATIONS: 'bg-orange-100 text-orange-800',
    CUSTOM: 'bg-slate-100 text-slate-800',
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">{report.name}</h3>
              </div>
              <Badge className={categoryColors[report.category] ?? categoryColors.CUSTOM}>
                {report.category}
              </Badge>
            </div>
            {report.description && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {report.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>{t('by')} {report.createdBy?.fullName ?? '—'}</span>
              {report.isPublic && (
                <Badge variant="outline" className="text-xs">
                  {t('public')}
                </Badge>
              )}
            </div>
            {report.lastRunAt && (
              <p className="mt-1 text-xs text-slate-500">
                {t('lastRun')}{' '}
                {formatDistanceToNow(new Date(report.lastRunAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/reports/${report.id}/run`}>
                  <Play className="mr-1 h-3 w-3" />
                  {t('run')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" title={t('copy')}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" title={t('delete')}>
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/reports/${report.id}`}>
                  <Eye className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
