'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type OrgPartyLinkFormProps = {
  globalPartyId: string
  globalPartyName: string
  onSuccess: () => void
  onCancel: () => void
  linkGlobalSupplier: (
    globalPartyId: string,
    data: {
      localAlias?: string
      localContactName?: string
      localContactEmail?: string
      localContactPhone?: string
      preferred?: boolean
      paymentTerms?: string
      discountPct?: number
      notes?: string
    }
  ) => Promise<{ success: boolean; linkId?: string }>
}

export function OrgPartyLinkForm({
  globalPartyId,
  onSuccess,
  onCancel,
  linkGlobalSupplier,
}: OrgPartyLinkFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [localAlias, setLocalAlias] = useState('')
  const [localContactName, setLocalContactName] = useState('')
  const [localContactEmail, setLocalContactEmail] = useState('')
  const [localContactPhone, setLocalContactPhone] = useState('')
  const [preferred, setPreferred] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState('')
  const [discountPct, setDiscountPct] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await linkGlobalSupplier(globalPartyId, {
        localAlias: localAlias.trim() || undefined,
        localContactName: localContactName.trim() || undefined,
        localContactEmail: localContactEmail.trim() || undefined,
        localContactPhone: localContactPhone.trim() || undefined,
        preferred,
        paymentTerms: paymentTerms.trim() || undefined,
        discountPct: discountPct ? parseFloat(discountPct) : undefined,
        notes: notes.trim() || undefined,
      })
      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to link supplier')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="erp-form-page space-y-4">
      <div>
        <Label htmlFor="localAlias">Local alias (optional)</Label>
        <Input
          id="localAlias"
          value={localAlias}
          onChange={(e) => setLocalAlias(e.target.value)}
          placeholder="e.g. CEMEX CDMX"
          className="mt-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="localContactName">Contact name</Label>
          <Input
            id="localContactName"
            value={localContactName}
            onChange={(e) => setLocalContactName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="localContactEmail">Contact email</Label>
          <Input
            id="localContactEmail"
            type="email"
            value={localContactEmail}
            onChange={(e) => setLocalContactEmail(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="localContactPhone">Contact phone</Label>
        <Input
          id="localContactPhone"
          value={localContactPhone}
          onChange={(e) => setLocalContactPhone(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="paymentTerms">Payment terms</Label>
        <Input
          id="paymentTerms"
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="e.g. Net 30"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="discountPct">Discount %</Label>
        <Input
          id="discountPct"
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={discountPct}
          onChange={(e) => setDiscountPct(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="preferred"
          checked={preferred}
          onChange={(e) => setPreferred(e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="preferred" className="font-normal">
          Mark as preferred supplier
        </Label>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Linking…' : 'Link supplier'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
