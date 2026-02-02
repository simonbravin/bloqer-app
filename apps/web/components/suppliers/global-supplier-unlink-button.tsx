'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type GlobalSupplierUnlinkButtonProps = {
  globalPartyId: string
  supplierName: string
  unlinkGlobalSupplier: (globalPartyId: string) => Promise<unknown>
}

export function GlobalSupplierUnlinkButton({
  globalPartyId,
  supplierName,
  unlinkGlobalSupplier,
}: GlobalSupplierUnlinkButtonProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleUnlink() {
    if (!confirm(`Remove ${supplierName} from your suppliers?`)) return
    setSubmitting(true)
    try {
      await unlinkGlobalSupplier(globalPartyId)
      router.push('/suppliers')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unlink')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
      onClick={handleUnlink}
      disabled={submitting}
    >
      {submitting ? 'Unlinking…' : 'Unlink supplier'}
    </Button>
  )
}
