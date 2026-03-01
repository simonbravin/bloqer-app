import { notFound } from 'next/navigation'
import { getScheduleForView } from '@/app/actions/schedule'
import { PrintDocumentShell } from '@/components/print/print-document-shell'
import { PrintTable } from '@/components/print/print-table'

type PageProps = {
  params: Promise<{ scheduleId: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type TaskRow = {
  code: string
  name: string
  startDate: string
  endDate: string
  duration: number
  progress: string
}

function parseDateParam(value: string | string[] | undefined): Date | null {
  if (!value || Array.isArray(value)) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export default async function PrintSchedulePage({ params, searchParams }: PageProps) {
  const { scheduleId } = await params
  const query = searchParams ? await searchParams : undefined

  const schedule = await getScheduleForView(scheduleId)

  if (!schedule) return notFound()

  const project = schedule.project as { name?: string; projectNumber?: string } | null
  let tasks = (schedule.tasks ?? []) as Array<{
    wbsNode?: { code?: string; name?: string } | null
    plannedStartDate?: string
    plannedEndDate?: string
    plannedDuration?: number
    progressPercent?: number
  }>

  const fromDate = parseDateParam(query?.from)
  const toDate = parseDateParam(query?.to)
  const filterByRange = !!(
    fromDate &&
    toDate &&
    fromDate.getTime() <= toDate.getTime()
  )

  if (filterByRange && fromDate && toDate) {
    const fromMs = fromDate.getTime()
    const toMs = toDate.getTime()
    tasks = tasks.filter((task) => {
      const startStr = task.plannedStartDate
      const endStr = task.plannedEndDate
      if (!startStr || !endStr) return true
      const start = new Date(startStr).getTime()
      const end = new Date(endStr).getTime()
      return end >= fromMs && start <= toMs
    })
  }

  const dateRangeSubtitle =
    filterByRange && fromDate && toDate
      ? ` (${fromDate.toLocaleDateString('es-AR', { dateStyle: 'short' })} – ${toDate.toLocaleDateString('es-AR', { dateStyle: 'short' })})`
      : ''

  const rows: TaskRow[] = tasks.map((task) => ({
    code: task.wbsNode?.code ?? '—',
    name: task.wbsNode?.name ?? '—',
    startDate: task.plannedStartDate
      ? new Date(task.plannedStartDate).toLocaleDateString('es-AR', { dateStyle: 'short' })
      : '—',
    endDate: task.plannedEndDate
      ? new Date(task.plannedEndDate).toLocaleDateString('es-AR', { dateStyle: 'short' })
      : '—',
    duration: task.plannedDuration ?? 0,
    progress: typeof task.progressPercent === 'number' ? `${task.progressPercent}%` : '0%',
  }))

  const columns = [
    { key: 'code' as const, label: 'Código', align: 'left' as const },
    { key: 'name' as const, label: 'Actividad', align: 'left' as const },
    { key: 'startDate' as const, label: 'Inicio', align: 'left' as const },
    { key: 'endDate' as const, label: 'Fin', align: 'left' as const },
    { key: 'duration' as const, label: 'Duración (días)', align: 'right' as const },
    { key: 'progress' as const, label: 'Avance %', align: 'center' as const },
  ]

  return (
    <PrintDocumentShell
      templateId="schedule"
      id={scheduleId}
      query={query ?? undefined}
      project={
        project?.name != null
          ? { name: project.name, projectNumber: project.projectNumber }
          : undefined
      }
    >
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Cronograma — {project?.name ?? 'Proyecto'}
          {project?.projectNumber ? ` (${project.projectNumber})` : ''}
          {dateRangeSubtitle}
        </h2>
        {rows.length === 0 && filterByRange ? (
          <p className="text-sm text-muted-foreground">
            No hay tareas en el período seleccionado.
          </p>
        ) : (
          <PrintTable<TaskRow> columns={columns} rows={rows} />
        )}
      </div>
    </PrintDocumentShell>
  )
}
