import { getSuperAdminLogs } from '@/app/actions/super-admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function SuperAdminLogsPage() {
  const logs = await getSuperAdminLogs(200)
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Audit logs
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          All Super Admin actions. Use for troubleshooting and compliance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent actions ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })}
                  </TableCell>
                  <TableCell className="text-sm">{log.superAdminEmail}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {log.action}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.targetType} / {log.targetId.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                    {log.details
                      ? JSON.stringify(log.details as object)
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {logs.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No audit logs yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
