'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Camera, Loader2 } from 'lucide-react'
import { ACCEPT_ATTACHMENTS, ACCEPT_IMAGES_ONLY } from '@/lib/file-accept'

export type FileAndCameraTriggerProps = {
  onFileSelect: (file: File) => void
  /** Default: full attachments (images, PDF, docs). Set true for avatar/logo. */
  imagesOnly?: boolean
  disabled?: boolean
  loading?: boolean
  uploadLabel?: string
  cameraLabel?: string
  /** Show "Tomar foto" button (default true). Set false to only show file picker. */
  showCamera?: boolean
  /** Optional translation function (e.g. useTranslations('common')). */
  t?: (key: string, opts?: { defaultValue?: string }) => string
}

const defaultUploadLabel = 'Subir archivo'
const defaultCameraLabel = 'Tomar foto'

export function FileAndCameraTrigger({
  onFileSelect,
  imagesOnly = false,
  disabled = false,
  loading = false,
  uploadLabel,
  cameraLabel,
  showCamera = true,
  t,
}: FileAndCameraTriggerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const accept = imagesOnly ? ACCEPT_IMAGES_ONLY : ACCEPT_ATTACHMENTS

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    e.target.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const uploadText = uploadLabel ?? (t ? t('uploadFile', { defaultValue: defaultUploadLabel }) : defaultUploadLabel)
  const cameraText = cameraLabel ?? (t ? t('takePhoto', { defaultValue: defaultCameraLabel }) : defaultCameraLabel)

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled || loading}
        className="hidden"
      />
      {showCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          disabled={disabled || loading}
          className="hidden"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || loading}
          onClick={() => fileInputRef.current?.click()}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploadText}
        </Button>
        {showCamera && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            {cameraText}
          </Button>
        )}
      </div>
    </>
  )
}
