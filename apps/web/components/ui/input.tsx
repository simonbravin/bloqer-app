import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  numeric?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, numeric, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-card dark:bg-background px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'hover:border-border transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input',
          numeric && 'font-mono tabular-nums text-right',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
