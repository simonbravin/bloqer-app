import { getAllOrganizations } from '@/app/actions/super-admin'
import { OrganizationsListClient } from '@/components/super-admin/organizations-list-client'

export default async function SuperAdminOrganizationsPage() {
  const orgs = await getAllOrganizations()
  const serialized = orgs.map((o) => ({
    ...o,
    createdAt: o.createdAt,
  }))
  return (
    <div className="p-6">
      <OrganizationsListClient orgs={serialized} />
    </div>
  )
}
