'use client'

import { UserMenu } from './user-menu'
import { Breadcrumbs } from './breadcrumbs'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

type HeaderProps = {
  orgName: string
  userName: string
  breadcrumbOverrides?: { segment: string; label: string }[]
  /** Optional class for layout */
  className?: string
}

export function Header({
  orgName,
  userName,
  breadcrumbOverrides,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex flex-col gap-0.5">
          <Breadcrumbs overrides={breadcrumbOverrides} />
          <span className="text-xs text-muted-foreground">{orgName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserMenu userName={userName} />
      </div>
    </header>
  )
}
