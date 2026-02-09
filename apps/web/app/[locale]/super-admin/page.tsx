import { getSuperAdminDashboardStats } from '@/app/actions/super-admin'
import { SuperAdminDashboardClient } from '@/components/super-admin/super-admin-dashboard-client'

export default async function SuperAdminDashboardPage() {
  const stats = await getSuperAdminDashboardStats()
  return <SuperAdminDashboardClient stats={stats} />
}
