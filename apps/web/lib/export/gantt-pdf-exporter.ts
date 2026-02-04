import PDFDocument from 'pdfkit'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface GanttPDFConfig {
  projectName: string
  projectNumber: string
  scheduleName: string
  projectStartDate: Date
  projectEndDate: Date
  companyName?: string
  companyLogo?: string
  tasks: Array<{
    code: string
    name: string
    startDate: Date
    endDate: Date
    duration: number
    progress: number
    isCritical: boolean
    level: number
  }>
}

export async function exportGanttToPDF(
  config: GanttPDFConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
    }) as PDFKit.PDFDocument

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    try {
      drawHeader(doc, config)

      doc.moveDown()
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a')
      doc.text('CRONOGRAMA DE PROYECTO', { align: 'center' })

      doc.moveDown()
      doc.fontSize(12).font('Helvetica')
      doc.text(`Proyecto: ${config.projectName}`, { align: 'center' })
      doc.text(`Cronograma: ${config.scheduleName}`, { align: 'center' })
      doc.text(
        `Duración: ${format(config.projectStartDate, 'dd/MM/yyyy', { locale: es })} - ${format(config.projectEndDate, 'dd/MM/yyyy', { locale: es })}`,
        { align: 'center' }
      )

      doc.moveDown(2)

      drawTasksTable(doc, config.tasks)

      doc.moveDown()
      drawLegend(doc)

      drawFooter(doc)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

function drawHeader(
  doc: PDFKit.PDFDocument,
  config: GanttPDFConfig
) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b')
  doc.text(config.companyName || 'EMPRESA', 50, 50)
  doc.moveTo(50, 75).lineTo(doc.page.width - 50, 75).stroke('#cbd5e1')
}

const colWidths = [60, 200, 80, 80, 60, 60]
const rowHeight = 20

function drawTasksTable(
  doc: PDFKit.PDFDocument,
  tasks: GanttPDFConfig['tasks']
) {
  const startY = doc.y
  const tableWidth = colWidths.reduce((a, b) => a + b, 0)

  doc.rect(50, startY, tableWidth, rowHeight).fill('#1e293b')
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')

  let x = 50
  const headers = ['Código', 'Tarea', 'Inicio', 'Fin', 'Duración', 'Progreso']
  headers.forEach((header, idx) => {
    doc.text(header, x + 5, startY + 6, {
      width: colWidths[idx]! - 10,
      align: idx > 1 ? 'center' : 'left',
    })
    x += colWidths[idx]!
  })

  let y = startY + rowHeight
  doc.fontSize(8).font('Helvetica')

  for (const task of tasks) {
    if (y > doc.page.height - 100) {
      doc.addPage({ size: 'A4', layout: 'landscape', margins: { top: 50, bottom: 50, left: 50, right: 50 } })
      doc.bufferedPageRange()
      y = 50
    }

    if (task.isCritical) {
      doc.rect(50, y, tableWidth, rowHeight).fill('#fee2e2')
    } else if (tasks.indexOf(task) % 2 === 0) {
      doc.rect(50, y, tableWidth, rowHeight).fill('#f8fafc')
    }

    doc.fillColor('#0f172a')
    x = 50
    const indent = task.level * 10
    doc.text(task.code, x + indent + 5, y + 6, {
      width: colWidths[0] - indent - 10,
    })
    x += colWidths[0]

    doc.text(task.name.substring(0, 40), x + 5, y + 6, {
      width: colWidths[1] - 10,
    })
    x += colWidths[1]

    doc.text(format(task.startDate, 'dd/MM/yy'), x + 5, y + 6, {
      width: colWidths[2] - 10,
      align: 'center',
    })
    x += colWidths[2]

    doc.text(format(task.endDate, 'dd/MM/yy'), x + 5, y + 6, {
      width: colWidths[3] - 10,
      align: 'center',
    })
    x += colWidths[3]

    doc.text(`${task.duration}d`, x + 5, y + 6, {
      width: colWidths[4] - 10,
      align: 'center',
    })
    x += colWidths[4]

    doc.text(`${task.progress}%`, x + 5, y + 6, {
      width: colWidths[5] - 10,
      align: 'center',
    })

    y += rowHeight
  }
}

function drawLegend(doc: PDFKit.PDFDocument) {
  const y = doc.y + 10
  doc.fontSize(9).font('Helvetica-Bold')
  doc.text('Leyenda:', 50, y)
  doc.fontSize(8).font('Helvetica')
  doc.rect(100, y, 15, 10).fill('#fee2e2')
  doc.fillColor('#0f172a')
  doc.text('Ruta Crítica', 120, y + 2)
  doc.rect(200, y, 15, 10).fill('#f8fafc')
  doc.text('Tareas Normales', 220, y + 2)
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange()
  const pageCount = range.count

  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i)
    const footerY = doc.page.height - 30
    doc.fontSize(8).font('Helvetica').fillColor('#64748b')
    doc.text(
      `Generado el ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es })}`,
      50,
      footerY,
      { align: 'left' }
    )
    doc.text(`Página ${i + 1} de ${pageCount}`, doc.page.width - 50, footerY, {
      align: 'right',
    })
  }
}
