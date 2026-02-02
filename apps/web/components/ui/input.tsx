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
          'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'hover:border-input hover:bg-muted/30',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-accent',
          'active:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input disabled:hover:bg-transparent',
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
