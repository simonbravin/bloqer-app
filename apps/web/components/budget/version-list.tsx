'use client'

import { useTranslations } from 'next-intl'
import { VersionCard, type VersionRow } from './version-card'

type VersionListProps = {
  projectId: string
  versions: VersionRow[]
  canEdit: boolean
  onSetBaseline: (versionId: string) => Promise<void>
  onApprove: (versionId: string) => Promise<void>
  onCopy: (versionId: string) => Promise<void>
}

export function VersionList({
  projectId,
  versions,
  canEdit,
  onSetBaseline,
  onApprove,
  onCopy,
}: VersionListProps) {
  const t = useTranslations('budget')
  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        {t('noBudgetVersionsYet')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {versions.map((v) => (
        <VersionCard
          key={v.id}
          projectId={projectId}
          version={v}
          canEdit={canEdit}
          onSetBaseline={onSetBaseline}
          onApprove={onApprove}
          onCopy={onCopy}
        />
      ))}
    </div>
  )
}
