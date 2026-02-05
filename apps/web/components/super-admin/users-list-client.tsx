'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Link } from '@/i18n/navigation'

interface UsersListClientProps {
  users: Array<{
    id: string
    fullName: string | null
    email: string
    createdAt: Date | string
    memberships: Array<{
      id: string
      organization: { id: string; name: string }
      isActive: boolean
    }>
  }>
}

export function UsersListClient({ users }: UsersListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.memberships.some((m) =>
        m.organization.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Todos los usuarios del sistema (excepto Super Admin). Vista entre organizaciones.
        </p>
        <div className="mt-4 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, email u organización…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-base"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Organizaciones</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-[80px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const activeCount = user.memberships.filter((m) => m.isActive).length
                const totalOrgs = user.memberships.length
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullName ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.memberships.map((m) => (
                          <Badge key={m.id} variant="outline" className="text-xs">
                            {m.organization.name}
                          </Badge>
                        ))}
                        {user.memberships.length === 0 && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={activeCount > 0 ? 'default' : 'secondary'}
                        className={activeCount > 0 ? 'bg-green-600' : ''}
                      >
                        {activeCount}/{totalOrgs}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/super-admin/users/${user.id}`} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay usuarios o no hay resultados para la búsqueda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
