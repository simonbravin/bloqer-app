'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationsDropdown } from './notifications-dropdown'
import { UserMenuDropdown } from './user-menu-dropdown'

interface DashboardHeaderProps {
  user: { name?: string | null; email?: string | null }
  orgName: string
}

/**
 * Dashboard header with org name, notifications, and user menu
 */
export function DashboardHeader({ user, orgName }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-foreground">Bloqer</span>
        <span className="text-muted-foreground/70">|</span>
        <p className="text-sm text-muted-foreground">{orgName}</p>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NotificationsDropdown />
        <UserMenuDropdown user={user} />
      </div>
    </header>
  )
}
