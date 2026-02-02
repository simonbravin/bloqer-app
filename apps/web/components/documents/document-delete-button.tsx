'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type DocumentDeleteButtonProps = {
  docId: string
  redirectTo: string
  deleteDocument: (docId: string) => Promise<unknown>
}

export function DocumentDeleteButton({
  docId,
  redirectTo,
  deleteDocument,
}: DocumentDeleteButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document? This will soft-delete it.')) {
      return
    }
    setDeleting(true)
    try {
      await deleteDocument(docId)
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
