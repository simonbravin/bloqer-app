import { DynamicSidebar } from '@/components/layout/dynamic-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BreadcrumbsContainer } from '@/components/layout/breadcrumbs-container'

interface DashboardLayoutProps {
  children: React.ReactNode
  orgName: string
  orgLogoUrl?: string | null
  userName: string
}

/**
 * Dashboard layout shell with dual navigation system
 * - Dynamic sidebar that changes based on context (Global vs Project)
 * - Header with org name, notifications, and user menu
 * - Dynamic breadcrumbs
 */
export function DashboardLayout({ children, orgName, orgLogoUrl, userName }: DashboardLayoutProps) {
  const user = { name: userName, email: null }
  
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - changes based on context */}
      <DynamicSidebar orgName={orgName} orgLogoUrl={orgLogoUrl} />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader user={user} orgName={orgName} />
        
        {/* Breadcrumbs - only renders container when there are breadcrumbs */}
        <BreadcrumbsContainer />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
