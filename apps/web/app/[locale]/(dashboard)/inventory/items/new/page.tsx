import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirectToLogin } from '@/lib/i18n-redirect'
import { PageHeader } from '@/components/layout/page-header'
import { ItemForm } from '@/components/inventory/item-form'

export default async function NewItemPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  return (
    <div className="h-full">
      <PageHeader
        title="Nuevo Item de Inventario"
        subtitle="Registra un nuevo material, equipo o insumo"
        breadcrumbs={[
          { label: 'Inventario', href: '/inventory' },
          { label: 'Items', href: '/inventory/items' },
          { label: 'Nuevo' },
        ]}
      />

      <div className="p-6">
        <div className="mx-auto max-w-3xl">
          <ItemForm />
        </div>
      </div>
    </div>
  )
}
