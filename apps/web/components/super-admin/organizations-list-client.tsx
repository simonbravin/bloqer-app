'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrgRowActions } from '@/components/super-admin/org-row-actions'

type OrgWithCount = {
  id: string
  name: string
  slug: string
  subscriptionPlan: string | null
  subscriptionStatus: string
  active: boolean
  isBlocked: boolean
  createdAt: Date | string
  _count: { members: number; projects: number }
}

interface OrganizationsListClientProps {
  orgs: OrgWithCount[]
}

export function OrganizationsListClient({ orgs }: OrganizationsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrgs = orgs.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.subscriptionPlan?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      org.subscriptionStatus.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Organizaciones
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestionar organizaciones, estado de suscripción y bloqueos.
        </p>
        <div className="mt-4 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, slug o plan…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-base"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizaciones ({filteredOrgs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Proyectos</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground">{org.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.subscriptionPlan ?? org.subscriptionStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    {org.isBlocked ? (
                      <Badge variant="destructive">Bloqueada</Badge>
                    ) : org.active ? (
                      <Badge variant="secondary">Activa</Badge>
                    ) : (
                      <Badge variant="outline">Inactiva</Badge>
                    )}
                  </TableCell>
                  <TableCell>{org._count.members}</TableCell>
                  <TableCell>{org._count.projects}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true, locale: es })}
                  </TableCell>
                  <TableCell>
                    <OrgRowActions org={org} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrgs.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay organizaciones o no hay resultados para la búsqueda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
