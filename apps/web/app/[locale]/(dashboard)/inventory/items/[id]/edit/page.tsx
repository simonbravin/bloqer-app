import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirectToLogin } from '@/lib/i18n-redirect'
import { notFound } from 'next/navigation'
import { prisma } from '@repo/database'
import { PageHeader } from '@/components/layout/page-header'
import { ItemForm } from '@/components/inventory/item-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const { id } = await params

  const item = await prisma.inventoryItem.findFirst({
    where: { id, orgId: org.orgId },
  })

  if (!item) notFound()

  return (
    <div className="h-full">
      <PageHeader
        title="Editar Item"
        subtitle={item.name}
        breadcrumbs={[
          { label: 'Inventario', href: '/inventory' },
          { label: 'Items', href: '/inventory/items' },
          { label: item.name, href: `/inventory/items/${item.id}` },
          { label: 'Editar' },
        ]}
      />

      <div className="p-6">
        <div className="mx-auto max-w-3xl">
          <ItemForm item={item} />
        </div>
      </div>
    </div>
  )
}
