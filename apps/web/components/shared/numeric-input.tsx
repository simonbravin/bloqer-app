import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format-utils'

export interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | null
  onChange: (value: number | null) => void
  decimals?: number
  locale?: string
}

/**
 * Numeric input with mono font for decimal alignment.
 * Uses design tokens for styling.
 */
const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      value,
      onChange,
      decimals = 2,
      locale = 'es-AR',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      value != null ? formatNumber(value, decimals, locale) : ''
    )
    const [isFocused, setIsFocused] = React.useState(false)

    React.useEffect(() => {
      if (!isFocused) {
        setInternalValue(
          value != null ? formatNumber(value, decimals, locale) : ''
        )
      }
    }, [value, decimals, locale, isFocused])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value
      setInternalValue(raw)
      if (raw === '' || raw === '-') {
        onChange(null)
        return
      }
      const parsed = parseFloat(raw.replace(/[^\d.-]/g, '').replace(',', '.'))
      onChange(Number.isNaN(parsed) ? null : parsed)
    }

    function handleBlur() {
      setIsFocused(false)
      setInternalValue(
        value != null ? formatNumber(value, decimals, locale) : ''
      )
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={internalValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn('font-mono tabular-nums text-right', className)}
        {...props}
      />
    )
  }
)
NumericInput.displayName = 'NumericInput'

export { NumericInput }
