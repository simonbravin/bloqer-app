import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirectToLogin } from '@/lib/i18n-redirect'
import { prisma } from '@repo/database'
import { PageHeader } from '@/components/layout/page-header'
import { MovementsListClient } from '@/components/inventory/movements-list-client'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Prisma } from '@repo/database'

type PageProps = {
  searchParams: Promise<{
    type?: string
    itemId?: string
    locationId?: string
    from?: string
    to?: string
  }>
}

export default async function MovementsListPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const params = await searchParams

  const where: Prisma.InventoryMovementWhereInput = { orgId: org.orgId }

  if (params.type) {
    where.movementType = params.type
  }

  if (params.itemId) {
    where.itemId = params.itemId
  }

  if (params.locationId) {
    where.OR = [
      { fromLocationId: params.locationId },
      { toLocationId: params.locationId },
    ]
  }

  if (params.from || params.to) {
    where.createdAt = {}
    if (params.from) {
      (where.createdAt as Prisma.DateTimeFilter).gte = new Date(params.from)
    }
    if (params.to) {
      const toDate = new Date(params.to)
      toDate.setHours(23, 59, 59, 999)
      ;(where.createdAt as Prisma.DateTimeFilter).lte = toDate
    }
  }

  const movements = await prisma.inventoryMovement.findMany({
    where,
    include: {
      item: {
        select: { sku: true, name: true, unit: true },
      },
      fromLocation: {
        select: { name: true, type: true },
      },
      toLocation: {
        select: { name: true, type: true },
      },
      project: {
        select: { projectNumber: true, name: true },
      },
      wbsNode: {
        select: { code: true, name: true },
      },
      createdBy: {
        select: {
          user: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const [items, locations] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { orgId: org.orgId, active: true },
      select: { id: true, sku: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.inventoryLocation.findMany({
      where: { orgId: org.orgId, active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="h-full">
      <PageHeader
        title="Movimientos de Inventario"
        subtitle={`${movements.length} movimientos encontrados`}
        breadcrumbs={[
          { label: 'Inventario', href: '/inventory' },
          { label: 'Movimientos', href: '/inventory/movements' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button asChild variant="accent">
              <Link href="/inventory/movements/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Movimiento
              </Link>
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <MovementsListClient
          movements={movements}
          items={items}
          locations={locations}
        />
      </div>
    </div>
  )
}
