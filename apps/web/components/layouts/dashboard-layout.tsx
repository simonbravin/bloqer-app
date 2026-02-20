import { DashboardShell } from '@/components/layouts/dashboard-shell'

interface DashboardLayoutProps {
  children: React.ReactNode
  orgName: string
  orgLogoUrl?: string | null
  user: { name: string; email?: string | null }
}

/**
 * Dashboard layout shell with dual navigation system
 * - Dynamic sidebar (user, notifications, theme, settings in sidebar footer)
 * - Minimal header: page title + search (+ hamburger on mobile)
 * - Mobile: sidebar as overlay drawer
 */
export function DashboardLayout({ children, orgName, orgLogoUrl, user }: DashboardLayoutProps) {
  return (
    <DashboardShell orgName={orgName} orgLogoUrl={orgLogoUrl} user={user}>
      {children}
    </DashboardShell>
  )
}
