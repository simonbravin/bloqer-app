'use client'

import * as React from 'react'
import { NumericInput } from '@/components/shared/numeric-input'
import { cn } from '@/lib/utils'

export interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof NumericInput>, 'value' | 'onChange'> {
  value: number | null
  onChange: (value: number | null) => void
  /** Currency symbol to show as prefix (default $) */
  symbol?: string
}

/**
 * Numeric input with currency symbol prefix (e.g. "$ ") for monetary fields.
 * Value remains numeric; symbol is display-only.
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, symbol = '$', className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center rounded-md border border-input bg-card dark:bg-background text-sm ring-offset-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          'has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50',
          className
        )}
      >
        <span className="pl-3 font-medium text-muted-foreground tabular-nums">
          {symbol}
        </span>
        <NumericInput
          ref={ref}
          value={value}
          onChange={onChange}
          decimals={2}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
