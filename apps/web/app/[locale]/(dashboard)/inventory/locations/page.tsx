import { getSession } from '@/lib/session'
import { getOrgContext } from '@/lib/org-context'
import { redirectToLogin } from '@/lib/i18n-redirect'
import { prisma } from '@repo/database'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Warehouse, Building2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const typeLabels: Record<string, string> = {
  CENTRAL_WAREHOUSE: 'Almacén',
  PROJECT_SITE: 'Obra',
  SUPPLIER: 'Proveedor',
}

const typeIcons: Record<string, typeof Warehouse> = {
  CENTRAL_WAREHOUSE: Warehouse,
  PROJECT_SITE: Building2,
  SUPPLIER: Building2,
}

type LocationRow = {
  id: string
  name: string
  type: string
  address: string | null
  items_count: bigint
  total_quantity: unknown
}

export default async function LocationsPage() {
  const session = await getSession()
  if (!session?.user?.id) return redirectToLogin()

  const org = await getOrgContext(session.user.id)
  if (!org) return redirectToLogin()

  const locationsWithStats = await prisma.$queryRaw<LocationRow[]>`
    SELECT 
      il.id,
      il.name,
      il.type,
      il.address,
      COUNT(DISTINCT im.item_id)::bigint as items_count,
      COALESCE(SUM(
        CASE 
          WHEN im.to_location_id = il.id THEN im.quantity
          WHEN im.from_location_id = il.id THEN -im.quantity
          ELSE 0
        END
      ), 0) as total_quantity
    FROM inventory.inventory_locations il
    LEFT JOIN inventory.inventory_movements im ON (im.to_location_id = il.id OR im.from_location_id = il.id)
    WHERE il.org_id = ${org.orgId}
    AND il.active = true
    GROUP BY il.id, il.name, il.type, il.address
    ORDER BY il.type, il.name
  `

  return (
    <div className="h-full">
      <PageHeader
        title="Ubicaciones de Inventario"
        subtitle="Gestiona almacenes, obras y puntos de stock"
        breadcrumbs={[
          { label: 'Inventario', href: '/inventory' },
          { label: 'Ubicaciones', href: '/inventory/locations' },
        ]}
        actions={
          <Button asChild variant="accent">
            <Link href="/inventory/locations/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Ubicación
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        {locationsWithStats.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
            No hay ubicaciones. Crea un almacén u obra para comenzar.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationsWithStats.map((location) => {
              const Icon = typeIcons[location.type] ?? Warehouse
              const typeLabel = typeLabels[location.type] ?? location.type
              const itemsCount = Number(location.items_count)
              const totalQty = Number(location.total_quantity)

              return (
                <Card key={location.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{location.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {typeLabel}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {location.address && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {location.address}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Items distintos</p>
                      <p className="font-mono text-lg font-bold tabular-nums">
                        {itemsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cantidad total</p>
                      <p className="font-mono text-lg font-bold tabular-nums">
                        {totalQty.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/inventory/locations/${location.id}`}>
                        Ver detalle
                      </Link>
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
