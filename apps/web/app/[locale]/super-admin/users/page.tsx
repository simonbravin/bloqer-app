import { getAllUsers } from '@/app/actions/super-admin'
import { UsersListClient } from '@/components/super-admin/users-list-client'

export default async function SuperAdminUsersPage() {
  const users = await getAllUsers()
  const serialized = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    createdAt: u.createdAt,
    memberships: u.memberships.map((m) => ({
      id: m.id,
      organization: m.organization,
      isActive: m.active,
    })),
  }))
  return (
    <div className="p-6">
      <UsersListClient users={serialized} />
    </div>
  )
}
