'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateFinanceTransactionSchema,
  type UpdateFinanceTransactionInput,
  type CreateFinanceLineInput,
} from '@repo/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CurrencyConverter } from './currency-converter'
import { TransactionLineForm, type LineInput } from './transaction-line-form'

type WbsOption = { id: string; code: string; name: string }

type TransactionEditClientProps = {
  transactionId: string
  transaction: {
    id: string
    type: string
    description: string
    issueDate: Date
    projectId: string | null
    partyId: string | null
    currency: string
    total: number
    amountBaseCurrency: number
    exchangeRateSnapshot: unknown
    reference: string | null
    lines: Array<{
      id: string
      description: string
      lineTotal: number
      wbsNode: { id: string; code: string; name: string } | null
    }>
  }
  wbsOptions: WbsOption[]
  updateTransaction: (id: string, data: UpdateFinanceTransactionInput) => Promise<{ error?: Record<string, string[]> } | { success: boolean }>
  addLine: (transactionId: string, data: CreateFinanceLineInput) => Promise<{ error?: Record<string, string[]> } | { success: boolean }>
  updateLine: (lineId: string, data: { description?: string; amount?: number; wbsNodeId?: string | null }) => Promise<{ error?: Record<string, string[]> } | { success: boolean }>
  deleteLine: (lineId: string) => Promise<unknown>
  fetchWbs: (projectId: string) => Promise<WbsOption[]>
}

const rateFromTx = (snap: unknown): number =>
  (snap as { rate?: number })?.rate ?? 1

export function TransactionEditClient({
  transactionId,
  transaction,
  wbsOptions: initialWbs,
  updateTransaction,
  addLine,
  updateLine,
  deleteLine,
  fetchWbs,
}: TransactionEditClientProps) {
  const router = useRouter()
  const [wbsOptions, setWbsOptions] = useState<WbsOption[]>(initialWbs)
  const [exchangeRate, setExchangeRate] = useState(rateFromTx(transaction.exchangeRateSnapshot))
  const {
    register,
    watch,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateFinanceTransactionInput>({
    resolver: zodResolver(updateFinanceTransactionSchema),
    defaultValues: {
      description: transaction.description,
      issueDate: transaction.issueDate.toISOString().slice(0, 10) as unknown as Date,
      projectId: transaction.projectId ?? undefined,
      partyId: transaction.partyId ?? undefined,
      currencyCode: transaction.currency,
      exchangeRateSnapshot: rateFromTx(transaction.exchangeRateSnapshot),
      reference: transaction.reference ?? undefined,
    },
  })

  const projectId = watch('projectId')
  const currencyCode = watch('currencyCode')
  useEffect(() => {
    if (!projectId) {
      setWbsOptions(initialWbs)
      return
    }
    fetchWbs(projectId).then(setWbsOptions).catch(() => setWbsOptions([]))
  }, [projectId, fetchWbs])

  const totalFromLines = transaction.lines.reduce((s, l) => s + l.lineTotal, 0)
  const baseAmount = totalFromLines * exchangeRate

  async function onHeaderSubmit(data: UpdateFinanceTransactionInput) {
    const result = await updateTransaction(transactionId, {
      ...data,
      exchangeRateSnapshot: exchangeRate,
    })
    if (result && 'error' in result && result.error) {
      Object.entries(result.error).forEach(([field, messages]) => {
        if (field !== '_form' && messages?.[0])
          setError(field as keyof UpdateFinanceTransactionInput, { message: messages[0] })
      })
      return
    }
    reset(data, { keepValues: true })
    router.refresh()
  }

  async function onAddLine(line: LineInput) {
    const result = await addLine(transactionId, {
      description: line.description,
      amount: line.amount,
      wbsNodeId: line.wbsNodeId ?? undefined,
      unit: line.unit ?? 'ea',
      quantity: line.quantity ?? 1,
    })
    if (result && 'error' in result && result.error) {
      alert(Object.values(result.error).flat().join(', '))
      return
    }
    router.refresh()
  }

  async function onDeleteLine(lineId: string) {
    await deleteLine(lineId)
    router.refresh()
  }

  return (
    <div className="erp-form-page space-y-6">
      <form onSubmit={handleSubmit(onHeaderSubmit)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Transaction</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400">Type</Label>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {transaction.type.replace(/_/g, ' ')}
            </p>
          </div>
          <div>
            <Label htmlFor="edit-date">Issue date</Label>
            <Input id="edit-date" type="date" {...register('issueDate')} className="mt-0.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Input id="edit-desc" {...register('description')} className="mt-0.5" />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="edit-currency">Currency</Label>
            <select
              id="edit-currency"
              {...register('currencyCode')}
              className="mt-0.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            >
              <option value={transaction.currency}>{transaction.currency}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="edit-rate">Exchange rate to base (USD)</Label>
            <Input
              id="edit-rate"
              type="number"
              min={0.000001}
              step={0.01}
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value) || 1)}
              className="mt-0.5"
            />
          </div>
        </div>
        <div className="mt-4">
          <CurrencyConverter
            amount={totalFromLines}
            currencyCode={currencyCode ?? transaction.currency}
            exchangeRate={exchangeRate}
            baseAmount={baseAmount}
            readOnly
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">Lines</h3>
        <TransactionLineForm wbsOptions={wbsOptions} onAdd={onAddLine} />
        {transaction.lines.length > 0 && (
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="py-2">Description</th>
                  <th className="py-2">WBS</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="w-20 py-2" />
                </tr>
              </thead>
              <tbody>
                {transaction.lines.map((line) => (
                  <tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 text-gray-900 dark:text-white">{line.description}</td>
                    <td className="py-2 font-mono text-gray-600 dark:text-gray-400">
                      {line.wbsNode ? `${line.wbsNode.code} ${line.wbsNode.name}` : '—'}
                    </td>
                    <td className="py-2 text-right tabular-nums text-gray-700 dark:text-gray-300">
                      {line.lineTotal.toFixed(2)}
                    </td>
                    <td className="py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 text-xs text-red-600 dark:text-red-400"
                        onClick={() => onDeleteLine(line.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
