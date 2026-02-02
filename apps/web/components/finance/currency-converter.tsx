'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CurrencyConverterProps = {
  amount: number
  currencyCode: string
  exchangeRate: number
  baseAmount: number
  onExchangeRateChange?: (rate: number) => void
  readOnly?: boolean
}

function formatMoney(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function CurrencyConverter({
  amount,
  currencyCode,
  exchangeRate,
  baseAmount,
  onExchangeRateChange,
  readOnly = false,
}: CurrencyConverterProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs text-gray-500 dark:text-gray-400">Amount</Label>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatMoney(amount, currencyCode)}
          </p>
        </div>
        {onExchangeRateChange && !readOnly ? (
          <div className="min-w-[120px]">
            <Label htmlFor="exchange-rate">Exchange rate</Label>
            <Input
              id="exchange-rate"
              type="number"
              min={0.000001}
              step={0.01}
              value={exchangeRate}
              onChange={(e) => onExchangeRateChange(Number(e.target.value) || 1)}
              className="mt-0.5"
            />
          </div>
        ) : (
          <div>
            <Label className="text-xs text-gray-500 dark:text-gray-400">Rate</Label>
            <p className="text-sm text-gray-700 dark:text-gray-300">{exchangeRate.toFixed(4)}</p>
          </div>
        )}
        <div>
          <Label className="text-xs text-gray-500 dark:text-gray-400">Base currency (USD)</Label>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatMoney(baseAmount)}
          </p>
        </div>
      </div>
    </div>
  )
}
