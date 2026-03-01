'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { listDocumentsForEntity, getDocumentDownloadUrl } from '@/app/actions/documents'
import { RFI_ENTITY, SUBMITTAL_ENTITY } from '@/lib/document-entities'
import { Paperclip, FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type EntityType = typeof RFI_ENTITY | typeof SUBMITTAL_ENTITY

type DocItem = Awaited<ReturnType<typeof listDocumentsForEntity>>[number]

export function QualityEntityAttachments({
  entityType,
  entityId,
}: {
  entityType: EntityType
  entityId: string
}) {
  const t = useTranslations('quality')
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDocumentsForEntity(entityType, entityId)
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }, [entityType, entityId])

  async function handleDownload(versionId: string) {
    try {
      const { url } = await getDocumentDownloadUrl(versionId)
      window.open(url, '_blank')
    } catch {
      toast.error(t('downloadError', { defaultValue: 'No se pudo descargar' }))
    }
  }

  if (loading) {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('attachments', { defaultValue: 'Adjuntos' })}
      </div>
    )
  }
  if (docs.length === 0) return null

  return (
    <div className="mt-4 rounded-md border border-border/60 bg-muted/30 px-3 py-2">
      <h3 className="text-xs font-medium uppercase text-muted-foreground">
        {t('attachments')} ({docs.length})
      </h3>
      <ul className="mt-2 space-y-1.5">
        {docs.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{doc.fileName || doc.title}</span>
            </span>
            <button
              type="button"
              onClick={() => handleDownload(doc.versionId)}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title={t('downloadAttachment', { defaultValue: 'Descargar' })}
              aria-label={t('downloadAttachment', { defaultValue: 'Descargar' })}
            >
              <FileDown className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
