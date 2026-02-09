'use client'

import { useTranslations } from 'next-intl'
import { Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenuDropdown } from './user-menu-dropdown'

interface DashboardHeaderProps {
  user: { name?: string | null; email?: string | null }
  orgName: string
}

/**
 * Dashboard header with org name, notifications, and user menu
 */
export function DashboardHeader({ user, orgName }: DashboardHeaderProps) {
  const t = useTranslations('common')
  
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold text-foreground">Construction ERP</span>
        <span className="text-muted-foreground/70">|</span>
        <p className="text-sm text-muted-foreground">{orgName}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme (light/dark) */}
        <ThemeToggle />
        {/* Notifications */}
        <button 
          className="relative rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        
        {/* User menu */}
        <UserMenuDropdown user={user} />
      </div>
    </header>
  )
}
