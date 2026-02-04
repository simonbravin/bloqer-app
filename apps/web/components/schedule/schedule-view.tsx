import { getScheduleForView } from '@/app/actions/schedule'
import { ScheduleViewClient } from './schedule-view-client'

interface ScheduleViewProps {
  scheduleId: string
  canEdit: boolean
  canSetBaseline: boolean
}

export async function ScheduleView({
  scheduleId,
  canEdit,
  canSetBaseline,
}: ScheduleViewProps) {
  const scheduleData = await getScheduleForView(scheduleId)

  if (!scheduleData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">
            No se pudo cargar el cronograma
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Verifica que el cronograma existe y tienes permisos para verlo
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScheduleViewClient
      scheduleData={scheduleData}
      canEdit={canEdit}
      canSetBaseline={canSetBaseline}
    />
  )
}
