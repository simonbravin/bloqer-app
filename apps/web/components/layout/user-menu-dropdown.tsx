'use client'

import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface UserMenuDropdownProps {
  user: { name?: string | null; email?: string | null }
}

/**
 * User menu dropdown with settings and logout
 */
export function UserMenuDropdown({ user }: UserMenuDropdownProps) {
  const t = useTranslations('nav')
  
  const displayName = user.name || user.email || 'Usuario'
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U'
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
          <span className="text-xs font-semibold text-slate-600">{initials}</span>
        </div>
        <span className="text-sm font-medium text-slate-700">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('settings')}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
