'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Package,
  Building2,
  FileText,
  Settings,
  DollarSign,
  BarChart3,
} from 'lucide-react'

interface GlobalSidebarProps {
  orgName?: string
  orgLogoUrl?: string | null
}

/**
 * Global sidebar for organization-wide navigation
 * Shows logo/org name, then: Dashboard, Projects, Team, Inventory, Suppliers, Documents, Settings
 */
export function GlobalSidebar({ orgName = 'Construction ERP', orgLogoUrl }: GlobalSidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  
  const navigation = [
    {
      name: t('dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('projects'),
      href: '/projects',
      icon: FolderKanban,
    },
    {
      name: t('reports'),
      href: '/reports',
      icon: BarChart3,
    },
    {
      name: t('team'),
      href: '/team',
      icon: Users,
    },
    {
      name: t('finance'),
      href: '/finance',
      icon: DollarSign,
    },
    {
      name: t('inventory'),
      href: '/inventory',
      icon: Package,
    },
    {
      name: t('suppliers'),
      href: '/suppliers',
      icon: Building2,
    },
    {
      name: t('documents'),
      href: '/documents',
      icon: FileText,
    },
    {
      name: t('settings'),
      href: '/settings',
      icon: Settings,
    },
  ]
  
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-slate-900">
      {/* Logo or org name */}
      <Link href="/dashboard" className="flex h-14 items-center border-b border-slate-800 px-2 py-0.5">
        {orgLogoUrl ? (
          <img
            src={orgLogoUrl}
            alt={orgName}
            className="h-[3.25rem] w-auto max-w-[180px] object-contain"
          />
        ) : (
          <span className="truncate text-lg font-bold text-white" title={orgName}>
            {orgName}
          </span>
        )}
      </Link>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = 
            pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-slate-800 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className="border-t border-slate-800 p-4">
        <p className="text-xs text-slate-400">
          © 2025 Construction ERP
        </p>
      </div>
    </aside>
  )
}
