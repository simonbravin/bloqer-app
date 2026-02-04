'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/format-utils'
import Link from 'next/link'

interface ProjectRow {
  projectId: string | null
  projectName: string
  projectNumber: string
  totalExpense: number
}

interface TopProjectsCompanyProps {
  projects: ProjectRow[]
}

export function TopProjectsCompany({ projects }: TopProjectsCompanyProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top proyectos por gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay datos de gastos por proyecto en los últimos 3 meses
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top proyectos por gasto (últimos 3 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Número</TableHead>
              <TableHead className="text-right">Gastos ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.projectId ?? p.projectName}>
                <TableCell className="font-medium">
                  {p.projectId ? (
                    <Link href={`/projects/${p.projectId}`} className="hover:underline">
                      {p.projectName}
                    </Link>
                  ) : (
                    p.projectName
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">{p.projectNumber}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(p.totalExpense, 'ARS')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
