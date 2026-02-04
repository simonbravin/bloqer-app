export type TaskType = 'TASK' | 'MILESTONE' | 'SUMMARY'

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export type ConstraintType =
  | 'ASAP' // As Soon As Possible
  | 'ALAP' // As Late As Possible
  | 'SNET' // Start No Earlier Than
  | 'SNLT' // Start No Later Than
  | 'FNET' // Finish No Earlier Than
  | 'FNLT' // Finish No Later Than
  | 'MFO' // Must Finish On
  | 'MSO' // Must Start On

export interface TaskDependency {
  id: string
  predecessorId: string
  successorId: string
  dependencyType: DependencyType
  lagDays: number
}

export interface ScheduleTaskData {
  id: string
  wbsNodeId: string
  wbsCode: string
  wbsName: string
  taskType: TaskType
  plannedStartDate: Date
  plannedEndDate: Date
  plannedDuration: number
  actualStartDate: Date | null
  actualEndDate: Date | null
  progressPercent: number
  isCritical: boolean
  totalFloat: number | null
  predecessors: TaskDependency[]
  successors: TaskDependency[]
}

export interface GanttViewConfig {
  zoom: 'day' | 'week' | 'month'
  showCriticalPath: boolean
  showBaseline: boolean
  showProgress: boolean
  showDependencies: boolean
  groupBy: 'none' | 'phase' | 'assigned'
}

export interface CriticalPathResult {
  criticalTasks: string[]
  projectDuration: number
  projectStartDate: Date
  projectEndDate: Date
}
