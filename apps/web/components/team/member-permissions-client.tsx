'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  MODULES,
  ROLE_PERMISSIONS,
  getEffectivePermissions,
  type Permission,
  type Module,
  type CustomPermissionsMap,
} from '@/lib/permissions'
import { updateMemberPermissions, resetMemberPermissions } from '@/app/actions/team'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const PERMISSION_LABELS: Record<Permission, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  export: 'Exportar',
  approve: 'Aprobar',
}

const MODULE_LABELS: Record<Module, string> = {
  dashboard: 'Dashboard',
  projects: 'Proyectos',
  budget: 'Presupuesto',
  finance: 'Finanzas',
  certifications: 'Certificaciones',
  inventory: 'Inventario',
  quality: 'Calidad',
  documents: 'Documentos',
  reports: 'Reportes',
  team: 'Equipo',
  settings: 'Configuración',
}

const ALL_PERMISSIONS: Permission[] = ['view', 'create', 'edit', 'delete', 'export', 'approve']

interface Props {
  member: {
    id: string
    role: string
    customPermissions: unknown
    user: { fullName: string; email: string }
  }
}

export function MemberPermissionsClient({ member }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const role = member.role as keyof typeof ROLE_PERMISSIONS
  const basePermissions = ROLE_PERMISSIONS[role] ?? {}
  const [customPermissions, setCustomPermissions] = useState<CustomPermissionsMap>(
    (member.customPermissions as CustomPermissionsMap) ?? null
  )
  const effectivePermissions = getEffectivePermissions(role as any, customPermissions)

  const handleTogglePermission = (module: Module, permission: Permission) => {
    setCustomPermissions((prev) => {
      const basePerms = basePermissions[module] ?? []
      const currentEffective = getEffectivePermissions(role as any, prev)[module] ?? []
      const hasNow = currentEffective.includes(permission)
      const nextEffective = hasNow
        ? currentEffective.filter((p) => p !== permission)
        : [...currentEffective, permission]
      const baseSet = new Set(basePerms)
      const nextSet = new Set(nextEffective)
      if (nextSet.size === baseSet.size && [...nextSet].every((p) => baseSet.has(p))) {
        const next = { ...(prev ?? {}) }
        if (module in next) {
          const { [module]: _, ...rest } = next
          return Object.keys(rest).length ? rest : null
        }
        return prev
      }
      return {
        ...(prev ?? {}),
        [module]: nextEffective,
      }
    })
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const payload = customPermissions && Object.keys(customPermissions).length > 0
        ? (customPermissions as Record<string, string[]>)
        : null
      const result = await updateMemberPermissions(member.id, payload)
      if (!result.success && 'error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Permisos actualizados')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async () => {
    setIsSubmitting(true)
    try {
      const result = await resetMemberPermissions(member.id)
      if (!result.success && 'error' in result) {
        toast.error(result.error)
        return
      }
      setCustomPermissions(null)
      toast.success('Permisos restaurados al rol base')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasCustomPermissions =
    customPermissions && Object.keys(customPermissions).length > 0

  if (member.role === 'OWNER') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              El OWNER tiene acceso total al sistema y no se puede modificar.
            </p>
            <Button asChild variant="outline" className="mt-3">
              <Link href="/team">Volver al equipo</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Rol base: <strong>{member.role}</strong>. Los permisos personalizados
          reemplazan los del rol base por módulo.
        </p>
        {hasCustomPermissions && (
          <p className="mt-1 text-xs text-muted-foreground">
            Este miembro tiene permisos personalizados activos.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {(Object.entries(MODULES) as [keyof typeof MODULES, Module][]).map(([key, module]) => {
          const basePerms = basePermissions[module] ?? []
          const effectivePerms = effectivePermissions[module] ?? []
          const customPerms = customPermissions?.[module]

          return (
            <Card key={module}>
              <CardHeader className="py-3">
                <CardTitle className="text-base">{MODULE_LABELS[module]}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6 py-3">
                {ALL_PERMISSIONS.map((permission) => {
                  const hasEffective = effectivePerms.includes(permission)
                  const isCustomized = customPerms !== undefined
                  return (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <Switch
                        id={`${module}-${permission}`}
                        checked={hasEffective}
                        onCheckedChange={() => handleTogglePermission(module, permission)}
                      />
                      <Label
                        htmlFor={`${module}-${permission}`}
                        className="cursor-pointer text-sm"
                      >
                        {PERMISSION_LABELS[permission]}
                        {isCustomized && ' *'}
                      </Label>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        * = Módulo con permisos personalizados (diferente del rol base)
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/team">Cancelar</Link>
        </Button>
        {hasCustomPermissions && (
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Restaurar a Rol Base
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  )
}
