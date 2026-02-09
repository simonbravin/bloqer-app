'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'
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

type NavModuleKey =
  | 'DASHBOARD'
  | 'PROJECTS'
  | 'REPORTS'
  | 'TEAM'
  | 'FINANCE'
  | 'INVENTORY'
  | 'DOCUMENTS'
  | 'SETTINGS'

interface GlobalSidebarProps {
  orgName?: string
  orgLogoUrl?: string | null
}

/**
 * Global sidebar for organization-wide navigation
 * Shows logo/org name, then: Dashboard, Projects, Team, Inventory, Suppliers, Documents, Settings
 * Items are filtered by RBAC (canView).
 */
export function GlobalSidebar({ orgName = 'Construction ERP', orgLogoUrl }: GlobalSidebarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { canView, status, loading } = usePermissions()

  const allNav = [
    { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard, module: 'DASHBOARD' as NavModuleKey },
    { name: t('projects'), href: '/projects', icon: FolderKanban, module: 'PROJECTS' as NavModuleKey },
    { name: t('reports'), href: '/reports', icon: BarChart3, module: 'REPORTS' as NavModuleKey },
    { name: t('team'), href: '/team', icon: Users, module: 'TEAM' as NavModuleKey },
    { name: t('finance'), href: '/finance', icon: DollarSign, module: 'FINANCE' as NavModuleKey },
    { name: t('inventory'), href: '/inventory', icon: Package, module: 'INVENTORY' as NavModuleKey },
    { name: t('suppliers'), href: '/suppliers', icon: Building2, module: 'PROJECTS' as NavModuleKey },
    { name: t('documents'), href: '/documents', icon: FileText, module: 'DOCUMENTS' as NavModuleKey },
    { name: t('settings'), href: '/settings', icon: Settings, module: 'SETTINGS' as NavModuleKey },
  ]

  const navigation =
    status === 'loading' || loading
      ? allNav
      : allNav.filter((item) => canView(item.module))

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo or org name */}
      <Link href="/dashboard" className="flex h-14 items-center border-b border-sidebar-border px-2 py-0.5">
        {orgLogoUrl ? (
          <img
            src={orgLogoUrl}
            alt={orgName}
            className="h-[3.25rem] w-auto max-w-[180px] object-contain"
          />
        ) : (
          <span className="truncate text-lg font-bold text-sidebar-foreground" title={orgName}>
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
                  ? 'bg-sidebar-accent text-sidebar-foreground' 
                  : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-muted">
          © 2025 Construction ERP
        </p>
      </div>
    </aside>
  )
}
