import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const buttonVariants = {
  default:
    'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 dark:bg-primary-foreground dark:text-primary dark:hover:opacity-90',
  accent:
    'bg-accent text-accent-foreground hover:opacity-90 active:opacity-80 focus-visible:ring-accent/50',
  outline:
    'border border-input bg-transparent hover:bg-accent/5 active:bg-accent/10 dark:hover:bg-accent/5',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
  ghost:
    'hover:bg-muted active:bg-muted/80 dark:hover:bg-muted dark:active:bg-muted/80',
}

const buttonSizes = {
  sm: 'h-8 px-2 text-xs',
  default: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'h-9 w-9',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      type = 'button',
      asChild,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'active:scale-[0.98]',
      'disabled:pointer-events-none disabled:opacity-50',
      buttonSizes[size],
      buttonVariants[variant],
      className
    )

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>
      return React.cloneElement(child, {
        className: cn(classes, child.props?.className),
      })
    }

    return (
      <button type={type} className={classes} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
