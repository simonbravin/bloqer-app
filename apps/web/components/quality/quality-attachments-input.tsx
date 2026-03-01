'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, Camera, X, FileText } from 'lucide-react'
import { ACCEPT_ATTACHMENTS } from '@/lib/file-accept'

type QualityAttachmentsInputProps = {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
}

export function QualityAttachmentsInput({
  files,
  onChange,
  disabled = false,
  maxFiles = 20,
}: QualityAttachmentsInputProps) {
  const t = useTranslations('quality')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function addFiles(newFiles: FileList | null) {
    if (!newFiles?.length) return
    const list = Array.from(newFiles)
    const combined = [...files, ...list].slice(0, maxFiles)
    onChange(combined)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  const atLimit = files.length >= maxFiles

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{t('attachments')}</Label>
      <p className="text-xs text-muted-foreground">
        {t('attachmentsHint', {
          defaultValue: 'Imágenes, PDF o documentos. En el celular podés subir archivos o tomar una foto.',
        })}
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTACHMENTS}
          multiple
          onChange={(e) => addFiles(e.target.files)}
          disabled={disabled || atLimit}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => addFiles(e.target.files)}
          disabled={disabled || atLimit}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || atLimit}
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('uploadFile', { defaultValue: 'Subir archivo' })}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || atLimit}
        >
          <Camera className="mr-2 h-4 w-4" />
          {t('takePhoto', { defaultValue: 'Tomar foto' })}
        </Button>
      </div>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1 rounded-lg border border-border bg-muted/30 p-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-destructive hover:text-destructive"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={t('removeAttachment', { defaultValue: 'Quitar' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
