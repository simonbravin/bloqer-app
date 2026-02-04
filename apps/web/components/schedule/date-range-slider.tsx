'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface DateRangeSliderProps {
  projectStartDate: Date
  projectEndDate: Date
  currentStartDate: Date
  currentEndDate: Date
  onRangeChange: (startDate: Date, endDate: Date) => void
}

export function DateRangeSlider({
  projectStartDate,
  projectEndDate,
  currentStartDate,
  currentEndDate,
  onRangeChange,
}: DateRangeSliderProps) {
  const t = useTranslations('schedule')

  const [rangeStart, setRangeStart] = useState(
    format(currentStartDate, 'yyyy-MM-dd')
  )
  const [rangeEnd, setRangeEnd] = useState(
    format(currentEndDate, 'yyyy-MM-dd')
  )
  const [daysToShow, setDaysToShow] = useState(
    Math.ceil(
      (currentEndDate.getTime() - currentStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  )

  function handleDaysChange(days: number) {
    const newDays = Math.max(5, Math.min(365, days))
    setDaysToShow(newDays)

    const start = new Date(rangeStart)
    const end = addDays(start, newDays)

    setRangeEnd(format(end, 'yyyy-MM-dd'))
    onRangeChange(start, end)
  }

  function handleStartChange(newStart: string) {
    setRangeStart(newStart)

    const start = new Date(newStart)
    const end = addDays(start, daysToShow)

    setRangeEnd(format(end, 'yyyy-MM-dd'))
    onRangeChange(start, end)
  }

  function handleEndChange(newEnd: string) {
    setRangeEnd(newEnd)

    const start = new Date(rangeStart)
    const end = new Date(newEnd)
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    setDaysToShow(Math.max(5, days))
    onRangeChange(start, end)
  }

  function handleResetToProject() {
    setRangeStart(format(projectStartDate, 'yyyy-MM-dd'))
    setRangeEnd(format(projectEndDate, 'yyyy-MM-dd'))

    const days = Math.ceil(
      (projectEndDate.getTime() - projectStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    setDaysToShow(days)

    onRangeChange(projectStartDate, projectEndDate)
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{t('visibleRange')}</Label>
        <Button variant="ghost" size="sm" onClick={handleResetToProject}>
          {t('resetToProject')}
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="daysSlider" className="text-sm">
            {t('daysToShow')}: <strong>{daysToShow}</strong>
          </Label>
          <Input
            type="number"
            min={5}
            max={365}
            value={daysToShow}
            onChange={(e) =>
              handleDaysChange(parseInt(e.target.value, 10) || 30)
            }
            className="w-20 text-right"
          />
        </div>
        <input
          id="daysSlider"
          type="range"
          min={5}
          max={365}
          step={1}
          value={daysToShow}
          onChange={(e) => handleDaysChange(parseInt(e.target.value, 10))}
          className="mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>5 días</span>
          <span>1 año</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rangeStart" className="text-xs">
            {t('viewFrom')}
          </Label>
          <div className="relative mt-1">
            <Calendar className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <Input
              id="rangeStart"
              type="date"
              value={rangeStart}
              onChange={(e) => handleStartChange(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="rangeEnd" className="text-xs">
            {t('viewTo')}
          </Label>
          <div className="relative mt-1">
            <Calendar className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            <Input
              id="rangeEnd"
              type="date"
              value={rangeEnd}
              onChange={(e) => handleEndChange(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {t('showingDaysInfo', {
          start: format(new Date(rangeStart), 'dd MMM', { locale: es }),
          end: format(new Date(rangeEnd), 'dd MMM', { locale: es }),
        })}
      </p>
    </div>
  )
}
