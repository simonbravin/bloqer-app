'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

type ProjectsToolbarProps = {
  status?: string
  search?: string
}

export function ProjectsToolbar({ status, search }: ProjectsToolbarProps) {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  return (
    <form
      method="get"
      action="/projects"
      className="mt-4 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="min-w-[320px]">
        <Label htmlFor="search" className="text-xs text-gray-500">
          {t('searchPlaceholder')}
        </Label>
        <Input
          id="search"
          name="search"
          type="search"
          placeholder={t('searchProjectName')}
          defaultValue={search}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="status" className="text-xs text-gray-500">
          {t('status')}
        </Label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ''}
          className="mt-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="">{tCommon('all')}</option>
          <option value="DRAFT">{t('statuses.DRAFT')}</option>
          <option value="ACTIVE">{t('statuses.ACTIVE')}</option>
          <option value="ON_HOLD">{t('statuses.ON_HOLD')}</option>
          <option value="COMPLETE">{t('statuses.COMPLETE')}</option>
        </select>
      </div>
      <Button type="submit" variant="outline">
        {tCommon('apply')}
      </Button>
    </form>
  )
}
