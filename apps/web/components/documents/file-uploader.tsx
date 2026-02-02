'use client'

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FileUploaderProps = {
  name: string
  accept?: string
  maxSizeBytes?: number
  required?: boolean
  onChange?: (file: File | null) => void
}

const DEFAULT_MAX = 50 * 1024 * 1024 // 50MB

export function FileUploader({
  name,
  accept,
  maxSizeBytes = DEFAULT_MAX,
  required = false,
  onChange,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > maxSizeBytes) {
      alert(`File too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`)
      if (inputRef.current) inputRef.current.value = ''
      onChange?.(null)
      return
    }
    onChange?.(file)
  }

  return (
    <div className="w-full">
      <Label htmlFor={name} className="erp-form-label">File</Label>
      <Input
        ref={inputRef}
        id={name}
        type="file"
        name={name}
        accept={accept}
        required={required}
        onChange={handleChange}
        className="mt-1 w-full min-w-0"
      />
      <p className="mt-1 text-xs text-gray-500">
        Max {Math.round(maxSizeBytes / 1024 / 1024)}MB
      </p>
    </div>
  )
}
