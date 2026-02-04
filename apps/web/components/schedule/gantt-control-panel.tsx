'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ZoomIn,
  ZoomOut,
  Calendar,
  TrendingUp,
  GitBranch,
  Download,
  Eye,
  Filter,
} from 'lucide-react'

interface GanttControlPanelProps {
  zoom: 'day' | 'week' | 'month'
  onZoomChange: (zoom: 'day' | 'week' | 'month') => void
  showCriticalPath: boolean
  onShowCriticalPathChange: (show: boolean) => void
  showBaseline: boolean
  onShowBaselineChange: (show: boolean) => void
  showProgress: boolean
  onShowProgressChange: (show: boolean) => void
  showDependencies: boolean
  onShowDependenciesChange: (show: boolean) => void
  groupBy: 'none' | 'phase' | 'assigned'
  onGroupByChange: (groupBy: 'none' | 'phase' | 'assigned') => void
  onExportPDF: () => void
}

export function GanttControlPanel({
  zoom,
  onZoomChange,
  showCriticalPath,
  onShowCriticalPathChange,
  showBaseline,
  onShowBaselineChange,
  showProgress,
  onShowProgressChange,
  showDependencies,
  onShowDependenciesChange,
  groupBy,
  onGroupByChange,
  onExportPDF,
}: GanttControlPanelProps) {
  const t = useTranslations('schedule')

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('zoom')}</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (zoom === 'month') onZoomChange('week')
                  if (zoom === 'week') onZoomChange('day')
                }}
                disabled={zoom === 'day'}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Select
                value={zoom}
                onValueChange={(v) =>
                  onZoomChange(v as 'day' | 'week' | 'month')
                }
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {t('daily')}
                    </div>
                  </SelectItem>
                  <SelectItem value="week">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {t('weekly')}
                    </div>
                  </SelectItem>
                  <SelectItem value="month">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {t('monthly')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (zoom === 'day') onZoomChange('week')
                  if (zoom === 'week') onZoomChange('month')
                }}
                disabled={zoom === 'month'}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('display')}</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="text-sm">{t('criticalPath')}</span>
              </div>
              <Switch
                checked={showCriticalPath}
                onCheckedChange={onShowCriticalPathChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-slate-600" />
                <span className="text-sm">{t('dependencies')}</span>
              </div>
              <Switch
                checked={showDependencies}
                onCheckedChange={onShowDependenciesChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('tracking')}</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{t('baseline')}</span>
              </div>
              <Switch
                checked={showBaseline}
                onCheckedChange={onShowBaselineChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t('progress')}</span>
              </div>
              <Switch
                checked={showProgress}
                onCheckedChange={onShowProgressChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('actions')}</Label>
            <div className="space-y-2">
              <Select
                value={groupBy}
                onValueChange={(v) =>
                  onGroupByChange(v as 'none' | 'phase' | 'assigned')
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Filter className="h-3 w-3" />
                      {groupBy === 'none' && t('noGrouping')}
                      {groupBy === 'phase' && t('groupByPhase')}
                      {groupBy === 'assigned' && t('groupByAssigned')}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noGrouping')}</SelectItem>
                  <SelectItem value="phase">{t('groupByPhase')}</SelectItem>
                  <SelectItem value="assigned">{t('groupByAssigned')}</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('exportPDF')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
