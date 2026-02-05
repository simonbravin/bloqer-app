/**
 * Types for custom reports (CustomReport model) and Query Builder.
 */

export interface CustomReportWithCreator {
  id: string
  orgId: string
  name: string
  description: string | null
  category: string
  reportType: string
  config: unknown
  isPublic: boolean
  createdByUserId: string
  lastRunAt: Date | null
  runCount: number
  createdAt: Date
  updatedAt: Date
  createdBy: {
    fullName: string
  } | null
}

// ==================== Query Builder ====================

export interface QueryField {
  field: string
  label: string
  type: 'text' | 'number' | 'date' | 'boolean'
  table: string
}

export type QueryFilterOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'BETWEEN'
  | 'IN'
  | 'CONTAINS'

export interface QueryFilter {
  id: string
  field: string
  operator: QueryFilterOperator
  value: unknown
}

export interface QueryJoin {
  table: string
  on: { left: string; right: string }
  type: 'INNER' | 'LEFT'
}

export interface QueryOrder {
  field: string
  direction: 'asc' | 'desc'
}

export interface QueryConfig {
  table: string
  joins?: QueryJoin[]
  where?: QueryFilter[]
  select: string[]
  groupBy?: string[]
  orderBy?: QueryOrder[]
  /** Filtrar por uno o más proyectos (vacío = todos) */
  projectIds?: string[]
  /** Rango de fechas (campo date de la tabla, ej. issueDate) */
  dateFrom?: string
  dateTo?: string
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'composed'
  xAxis: string
  yAxis: string | string[]
  colors?: string[]
  stacked?: boolean
  showLegend?: boolean
  showGrid?: boolean
}

export interface ExportColumn {
  field: string
  label: string
  type: 'text' | 'number' | 'currency' | 'date' | 'percentage'
  width?: number
  align?: 'left' | 'center' | 'right'
}

export interface ReportConfig {
  query: QueryConfig
  columns: ExportColumn[]
  chartConfig?: ChartConfig
  filters?: Record<string, unknown>
}

export interface TableRelation {
  table: string
  type: 'belongsTo' | 'hasMany'
  foreignKey: string
}

export interface TableMetadata {
  name: string
  label: string
  fields: QueryField[]
  relations: TableRelation[]
}

export interface ReportResult {
  data: Record<string, unknown>[]
  totalRows: number
  executionTime: number
  chartData?: Record<string, unknown>[]
}
