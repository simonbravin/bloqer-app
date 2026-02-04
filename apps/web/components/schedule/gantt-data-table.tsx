'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  Edit,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GanttDataTableTask {
  id: string
  code: string
  name: string
  taskType: 'TASK' | 'SUMMARY' | 'MILESTONE'
  startDate: Date
  endDate: Date
  duration: number
  progress: number
  isCritical: boolean
  level: number
  totalFloat: number | null
  predecessorCount: number
  successorCount: number
}

interface GanttDataTableProps {
  tasks: GanttDataTableTask[]
  expandedNodes: Set<string>
  onToggleExpand: (taskId: string) => void
  onTaskClick: (taskId: string) => void
  onDependenciesClick: (taskId: string) => void
  canEdit: boolean
  highlightedTask: string | null
}

export function GanttDataTable({
  tasks,
  expandedNodes,
  onToggleExpand,
  onTaskClick,
  onDependenciesClick,
  canEdit,
  highlightedTask,
}: GanttDataTableProps) {
  const t = useTranslations('schedule')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTasks = tasks.filter(
    (task) =>
      task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function shouldShowTask(task: GanttDataTableTask): boolean {
    if (searchQuery) return true

    const levelCodes = task.code.split('.')
    for (let i = 1; i < levelCodes.length; i++) {
      const parentCode = levelCodes.slice(0, i).join('.')
      const parentTask = tasks.find((t) => t.code === parentCode)
      if (parentTask && !expandedNodes.has(parentTask.id)) {
        return false
      }
    }
    return true
  }

  const visibleTasks = filteredTasks.filter(shouldShowTask)

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-2">
        <Input
          placeholder={t('searchTasks')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-slate-800">
            <TableRow className="h-[60px]">
              <TableHead className="w-[100px] px-2 py-2 text-xs text-white">
                {t('code')}
              </TableHead>
              <TableHead className="w-[200px] px-2 py-2 text-xs text-white">
                {t('task')}
              </TableHead>
              <TableHead className="w-[100px] px-2 py-2 text-xs text-white">
                {t('start')}
              </TableHead>
              <TableHead className="w-[100px] px-2 py-2 text-xs text-white">
                {t('end')}
              </TableHead>
              <TableHead className="w-[70px] px-2 py-2 text-right text-xs text-white">
                {t('days')}
              </TableHead>
              <TableHead className="w-[70px] px-2 py-2 text-right text-xs text-white">
                %
              </TableHead>
              <TableHead className="w-[70px] px-2 py-2 text-center text-xs text-white">
                {t('deps')}
              </TableHead>
              <TableHead className="w-[70px] px-2 py-2 text-center text-xs text-white">
                {t('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleTasks.map((task) => {
              const hasChildren = tasks.some((t) =>
                t.code.startsWith(task.code + '.')
              )
              const isExpanded = expandedNodes.has(task.id)
              const isHighlighted = highlightedTask === task.id

              return (
                <TableRow
                  key={task.id}
                  className={cn(
                    'h-[40px] transition-colors hover:bg-slate-50',
                    isHighlighted && 'bg-blue-50',
                    task.isCritical && 'bg-red-50'
                  )}
                >
                  <TableCell className="px-2 py-1 font-mono text-[10px]">
                    {task.code}
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    <div
                      className="flex items-center gap-1"
                      style={{ paddingLeft: `${task.level * 12}px` }}
                    >
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() => onToggleExpand(task.id)}
                          className="rounded p-0.5 hover:bg-slate-200"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      )}

                      <span
                        className={cn(
                          'truncate text-xs',
                          task.taskType === 'SUMMARY' && 'font-semibold'
                        )}
                        title={task.name}
                      >
                        {task.name}
                      </span>

                      {task.isCritical && (
                        <Badge
                          variant="destructive"
                          className="h-4 px-1 text-[8px]"
                        >
                          {t('critical')}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-1 text-[10px]">
                    {format(task.startDate, 'dd/MM/yy')}
                  </TableCell>

                  <TableCell className="px-2 py-1 text-[10px]">
                    {format(task.endDate, 'dd/MM/yy')}
                  </TableCell>

                  <TableCell className="px-2 py-1 font-mono text-[10px] text-right">
                    {task.duration}d
                  </TableCell>

                  <TableCell className="px-2 py-1">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={cn(
                            'h-full transition-all',
                            task.progress === 100
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-600">
                        {task.progress}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-2 py-1 text-center">
                    {(task.predecessorCount > 0 ||
                      task.successorCount > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDependenciesClick(task.id)}
                        className="h-6 w-6 p-0"
                      >
                        <GitBranch className="h-3 w-3 text-slate-600" />
                        <span className="ml-1 text-[9px]">
                          {task.predecessorCount + task.successorCount}
                        </span>
                      </Button>
                    )}
                  </TableCell>

                  <TableCell className="px-2 py-1 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskClick(task.id)}
                      disabled={!canEdit}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            {visibleTasks.length} {t('tasksShown')}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-red-600" />
              <span>
                {tasks.filter((t) => t.isCritical).length} {t('critical')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
