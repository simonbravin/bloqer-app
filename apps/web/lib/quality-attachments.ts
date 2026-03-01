'use client'

import { uploadProjectAttachmentAndLink } from '@/app/actions/documents'
import { toast } from 'sonner'

export type QualityFolderEntity = 'RFI' | 'Submittal'

export type UploadAttachmentsResult = {
  successCount: number
  failedNames: string[]
}

/**
 * Upload multiple files as quality attachments (RFI or Submittal) and link them to the entity.
 * Shows a single toast if any uploads fail.
 */
export async function uploadQualityAttachments(
  projectId: string,
  folderName: QualityFolderEntity,
  entityType: QualityFolderEntity,
  entityId: string,
  files: File[],
  t: (key: string, opts?: { defaultValue?: string; name?: string }) => string
): Promise<UploadAttachmentsResult> {
  const failedNames: string[] = []
  for (const file of files) {
    const formData = new FormData()
    formData.set('file', file)
    try {
      await uploadProjectAttachmentAndLink(
        projectId,
        folderName,
        entityType,
        entityId,
        formData
      )
    } catch {
      failedNames.push(file.name || 'Sin nombre')
    }
  }
  if (failedNames.length > 0) {
    toast.error(
      t('attachmentUploadError', {
        defaultValue: 'Error al subir {{name}}',
        name: failedNames.join(', '),
      })
    )
  }
  return {
    successCount: files.length - failedNames.length,
    failedNames,
  }
}
