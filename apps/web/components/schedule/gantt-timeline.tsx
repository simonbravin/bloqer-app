'use client'

import { useRef, useEffect, useState } from 'react'
import {
  format,
  eachDayOfInterval,
  isSameDay,
  addDays,
  isAfter,
} from 'date-fns'
import { es } from 'date-fns/locale'

const MIN_DISPLAY_DAYS = 42

export interface GanttTask {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  isCritical: boolean
  level: number
  taskType: 'TASK' | 'SUMMARY' | 'MILESTONE'
  dependencies: Array<{
    id: string
    targetId: string
    type: 'FS' | 'SS' | 'FF' | 'SF'
  }>
}

interface GanttTimelineProps {
  tasks: GanttTask[]
  projectStartDate: Date
  projectEndDate: Date
  zoom: 'day' | 'week' | 'month'
  showCriticalPath: boolean
  showDependencies: boolean
  onTaskClick?: (taskId: string) => void
  onTaskDrag?: (taskId: string, newStartDate: Date, newEndDate: Date) => void
}

const ROW_HEIGHT = 40
const TASK_NAME_WIDTH = 280
const HEADER_HEIGHT = 60

const ZOOM_DAY_WIDTH = {
  day: 40,
  week: 20,
  month: 8,
} as const

export function GanttTimeline({
  tasks,
  projectStartDate,
  projectEndDate,
  zoom,
  showCriticalPath,
  showDependencies,
  onTaskClick,
}: GanttTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)

  const DAY_WIDTH = ZOOM_DAY_WIDTH[zoom]

  const start = new Date(projectStartDate)
  const endFromData = isAfter(projectEndDate, start)
    ? new Date(projectEndDate)
    : addDays(start, 1)
  const minEnd = addDays(start, MIN_DISPLAY_DAYS)
  const end = isAfter(endFromData, minEnd) ? endFromData : minEnd

  const days = eachDayOfInterval({ start, end })
  const timelineWidth = days.length * DAY_WIDTH
  const totalWidth = TASK_NAME_WIDTH + timelineWidth
  const canvasHeight = HEADER_HEIGHT + tasks.length * ROW_HEIGHT + 50

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = totalWidth * dpr
    canvas.height = canvasHeight * dpr
    canvas.style.width = `${totalWidth}px`
    canvas.style.height = `${canvasHeight}px`
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, totalWidth, canvasHeight)

    drawBackground(ctx)
    drawHeader(ctx)
    drawGrid(ctx)
    drawTasks(ctx)

    if (showDependencies) {
      drawDependencies(ctx)
    }
  }, [
    tasks,
    zoom,
    showCriticalPath,
    showDependencies,
    hoveredTask,
    days,
    DAY_WIDTH,
    totalWidth,
    canvasHeight,
  ])

  function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, totalWidth, canvasHeight)
  }

  function drawHeader(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, totalWidth, HEADER_HEIGHT)

    ctx.fillStyle = '#334155'
    ctx.fillRect(0, 0, TASK_NAME_WIDTH, HEADER_HEIGHT)

    ctx.fillStyle = '#ffffff'
    ctx.font = '14px Inter, sans-serif'
    ctx.fillText('Tarea', 12, HEADER_HEIGHT / 2 + 5)

    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(TASK_NAME_WIDTH, 0)
    ctx.lineTo(TASK_NAME_WIDTH, HEADER_HEIGHT)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '11px Inter, sans-serif'

    if (zoom === 'day') {
      days.forEach((day, idx) => {
        const x = TASK_NAME_WIDTH + idx * DAY_WIDTH
        ctx.fillText(
          format(day, 'd'),
          x + DAY_WIDTH / 2 - 6,
          HEADER_HEIGHT - 15
        )
        if (day.getDate() === 1 || idx === 0) {
          ctx.font = 'bold 11px Inter, sans-serif'
          ctx.fillText(
            format(day, 'MMM yyyy', { locale: es }),
            x + 4,
            HEADER_HEIGHT - 35
          )
          ctx.font = '11px Inter, sans-serif'
        }
        if (day.getDate() === 1 && idx > 0) {
          ctx.strokeStyle = '#64748b'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, HEADER_HEIGHT)
          ctx.stroke()
        }
      })
    } else if (zoom === 'week') {
      days.forEach((day, idx) => {
        if (day.getDay() === 1) {
          const x = TASK_NAME_WIDTH + idx * DAY_WIDTH
          ctx.fillText(
            format(day, 'dd/MM', { locale: es }),
            x + 2,
            HEADER_HEIGHT - 15
          )
        }
        if (day.getDate() === 1 || idx === 0) {
          const x = TASK_NAME_WIDTH + idx * DAY_WIDTH
          ctx.font = 'bold 11px Inter, sans-serif'
          ctx.fillText(
            format(day, 'MMM yyyy', { locale: es }),
            x + 2,
            HEADER_HEIGHT - 35
          )
          ctx.font = '11px Inter, sans-serif'
        }
      })
    } else {
      let lastMonth: Date | null = null
      days.forEach((day, idx) => {
        const monthStart = new Date(day.getFullYear(), day.getMonth(), 1)
        if (
          !lastMonth ||
          monthStart.getTime() !== lastMonth.getTime()
        ) {
          lastMonth = monthStart
          const x = TASK_NAME_WIDTH + idx * DAY_WIDTH
          ctx.font = 'bold 12px Inter, sans-serif'
          ctx.fillText(
            format(day, 'MMMM yyyy', { locale: es }),
            x + 4,
            HEADER_HEIGHT / 2 + 5
          )
          ctx.font = '11px Inter, sans-serif'
        }
      })
    }
  }

  function drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1

    days.forEach((day, idx) => {
      const x = TASK_NAME_WIDTH + idx * DAY_WIDTH
      ctx.beginPath()
      ctx.moveTo(x, HEADER_HEIGHT)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
      if (day.getDay() === 0) {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.5)'
        ctx.fillRect(x, HEADER_HEIGHT, DAY_WIDTH, canvasHeight - HEADER_HEIGHT)
      }
    })

    tasks.forEach((_, idx) => {
      const y = HEADER_HEIGHT + (idx + 1) * ROW_HEIGHT
      ctx.strokeStyle = '#f1f5f9'
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(totalWidth, y)
      ctx.stroke()
    })

    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(TASK_NAME_WIDTH, HEADER_HEIGHT)
    ctx.lineTo(TASK_NAME_WIDTH, canvasHeight)
    ctx.stroke()
  }

  function drawTasks(ctx: CanvasRenderingContext2D) {
    tasks.forEach((task, idx) => {
      const y = HEADER_HEIGHT + idx * ROW_HEIGHT

      const indent = task.level * 16
      ctx.fillStyle =
        task.taskType === 'SUMMARY' ? '#0f172a' : '#334155'
      ctx.font =
        task.taskType === 'SUMMARY' ? 'bold 13px Inter' : '13px Inter'

      const maxTextWidth = TASK_NAME_WIDTH - indent - 20
      let displayName = task.name
      const textWidth = ctx.measureText(displayName).width
      if (textWidth > maxTextWidth) {
        while (
          ctx.measureText(displayName + '...').width > maxTextWidth &&
          displayName.length > 0
        ) {
          displayName = displayName.substring(0, displayName.length - 1)
        }
        displayName += '...'
      }
      ctx.fillText(displayName, 12 + indent, y + ROW_HEIGHT / 2 + 5)

      const startDay = days.findIndex((d) => isSameDay(d, task.startDate))
      const endDay = days.findIndex((d) => isSameDay(d, task.endDate))

      if (startDay === -1 || endDay === -1) return

      const barX = TASK_NAME_WIDTH + startDay * DAY_WIDTH
      const barWidth = Math.max(
        (endDay - startDay + 1) * DAY_WIDTH,
        DAY_WIDTH * 0.5
      )
      const barY = y + 8
      const barHeight = task.taskType === 'SUMMARY' ? 24 : 20

      const isHovered = hoveredTask === task.id

      let barColor = '#3b82f6'
      let borderColor = '#1e40af'
      if (task.isCritical && showCriticalPath) {
        barColor = '#dc2626'
        borderColor = '#991b1b'
      }
      if (task.taskType === 'SUMMARY') {
        barColor = '#0ea5e9'
        borderColor = '#0369a1'
      }

      ctx.fillStyle = isHovered ? barColor : barColor + 'dd'

      if (task.taskType === 'SUMMARY') {
        ctx.beginPath()
        ctx.moveTo(barX, barY + barHeight / 2)
        ctx.lineTo(barX + 6, barY)
        ctx.lineTo(barX + barWidth - 6, barY)
        ctx.lineTo(barX + barWidth, barY + barHeight / 2)
        ctx.lineTo(barX + barWidth - 6, barY + barHeight)
        ctx.lineTo(barX + 6, barY + barHeight)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = borderColor
        ctx.lineWidth = isHovered ? 2 : 1.5
        ctx.stroke()
      } else {
        ctx.fillRect(barX, barY, barWidth, barHeight)
        if (task.progress > 0) {
          ctx.fillStyle = '#1e3a8a'
          const progressWidth = (barWidth * task.progress) / 100
          ctx.fillRect(barX, barY, progressWidth, barHeight)
        }
        ctx.strokeStyle = borderColor
        ctx.lineWidth = isHovered ? 2 : 1
        ctx.strokeRect(barX, barY, barWidth, barHeight)
        if (task.progress > 0 && barWidth > 40) {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 10px Inter'
          const progressText = `${task.progress}%`
          const tw = ctx.measureText(progressText).width
          ctx.fillText(
            progressText,
            barX + barWidth / 2 - tw / 2,
            barY + barHeight / 2 + 4
          )
        }
      }
    })
  }

  function drawDependencies(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 3])

    tasks.forEach((task, idx) => {
      task.dependencies.forEach((dep) => {
        const targetIdx = tasks.findIndex((t) => t.id === dep.targetId)
        if (targetIdx === -1) return

        const targetTask = tasks[targetIdx]!
        const startDay = days.findIndex((d) => isSameDay(d, task.endDate))
        const endDay = days.findIndex((d) =>
          isSameDay(d, targetTask.startDate)
        )

        if (startDay === -1 || endDay === -1) return

        const x1 = TASK_NAME_WIDTH + (startDay + 1) * DAY_WIDTH
        const y1 = HEADER_HEIGHT + idx * ROW_HEIGHT + ROW_HEIGHT / 2
        const x2 = TASK_NAME_WIDTH + endDay * DAY_WIDTH
        const y2 =
          HEADER_HEIGHT + targetIdx * ROW_HEIGHT + ROW_HEIGHT / 2

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        const headlen = 8
        const angle = Math.atan2(y2 - y1, x2 - x1)
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(
          x2 - headlen * Math.cos(angle - Math.PI / 6),
          y2 - headlen * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(x2, y2)
        ctx.lineTo(
          x2 - headlen * Math.cos(angle + Math.PI / 6),
          y2 - headlen * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
      })
    })

    ctx.setLineDash([])
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / totalWidth
    const scaleY = rect.height / canvasHeight
    const x = (e.clientX - rect.left) / scaleX
    const y = (e.clientY - rect.top) / scaleY

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]!
      const startDay = days.findIndex((d) => isSameDay(d, task.startDate))
      const endDay = days.findIndex((d) => isSameDay(d, task.endDate))
      if (startDay === -1 || endDay === -1) continue

      const barX = TASK_NAME_WIDTH + startDay * DAY_WIDTH
      const barWidth = Math.max(
        (endDay - startDay + 1) * DAY_WIDTH,
        DAY_WIDTH * 0.5
      )
      const barY = HEADER_HEIGHT + i * ROW_HEIGHT + 8
      const barHeight = task.taskType === 'SUMMARY' ? 24 : 20

      if (
        x >= barX &&
        x <= barX + barWidth &&
        y >= barY &&
        y <= barY + barHeight
      ) {
        onTaskClick?.(task.id)
        return
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width / totalWidth
    const scaleY = rect.height / canvasHeight
    const x = (e.clientX - rect.left) / scaleX
    const y = (e.clientY - rect.top) / scaleY

    let found: string | null = null
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]!
      const startDay = days.findIndex((d) => isSameDay(d, task.startDate))
      const endDay = days.findIndex((d) => isSameDay(d, task.endDate))
      if (startDay === -1 || endDay === -1) continue

      const barX = TASK_NAME_WIDTH + startDay * DAY_WIDTH
      const barWidth = Math.max(
        (endDay - startDay + 1) * DAY_WIDTH,
        DAY_WIDTH * 0.5
      )
      const barY = HEADER_HEIGHT + i * ROW_HEIGHT + 8
      const barHeight = task.taskType === 'SUMMARY' ? 24 : 20

      if (
        x >= barX &&
        x <= barX + barWidth &&
        y >= barY &&
        y <= barY + barHeight
      ) {
        found = task.id
        break
      }
    }
    setHoveredTask(found)
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto overflow-y-auto"
        style={{ maxHeight: '70vh' }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredTask(null)}
          className="cursor-pointer"
          style={{
            display: 'block',
            minWidth: `${totalWidth}px`,
          }}
        />
      </div>
    </div>
  )
}
