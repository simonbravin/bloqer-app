'use server'

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export interface ChartExportConfig {
  title: string
  subtitle?: string
  charts: Array<{
    title: string
    imageData: string
    height?: number
  }>
  tables?: Array<{
    title: string
    headers: string[]
    rows: string[][]
  }>
  metadata?: {
    project?: { name: string; number: string }
    dateRange?: { from: Date; to: Date }
    generatedBy?: string
    generatedAt?: Date
  }
}

type DocWithAutoTable = jsPDF & {
  autoTable: (options: {
    startY: number
    head: string[][]
    body: string[][]
    theme?: string
    styles?: { fontSize?: number; cellPadding?: number }
    headStyles?: { fillColor?: number[]; textColor?: number; fontStyle?: string }
    alternateRowStyles?: { fillColor?: number[] }
  }) => void
  lastAutoTable: { finalY: number }
}

export async function exportDashboardToPDF(config: ChartExportConfig): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as DocWithAutoTable

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let currentY = margin

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Construction ERP', margin, currentY)
  currentY += 10

  doc.setDrawColor(200)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  doc.setFontSize(18)
  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold')
  doc.text(config.title, margin, currentY)
  currentY += 8

  if (config.subtitle) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(config.subtitle, margin, currentY)
    currentY += 10
  }

  if (config.metadata) {
    doc.setFontSize(9)
    doc.setTextColor(80)

    if (config.metadata.project) {
      doc.text(
        `Proyecto: ${config.metadata.project.number} - ${config.metadata.project.name}`,
        margin,
        currentY
      )
      currentY += 5
    }

    if (config.metadata.dateRange) {
      doc.text(
        `Período: ${config.metadata.dateRange.from.toLocaleDateString('es')} - ${config.metadata.dateRange.to.toLocaleDateString('es')}`,
        margin,
        currentY
      )
      currentY += 5
    }

    doc.text(
      `Generado: ${new Date().toLocaleString('es-AR')}`,
      margin,
      currentY
    )
    currentY += 10
  }

  for (const chart of config.charts) {
    const chartHeight = chart.height ?? 80
    if (currentY + chartHeight + 20 > pageHeight - margin) {
      doc.addPage()
      currentY = margin
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text(chart.title, margin, currentY)
    currentY += 8

    try {
      const imgWidth = pageWidth - 2 * margin
      doc.addImage(
        chart.imageData,
        'PNG',
        margin,
        currentY,
        imgWidth,
        chartHeight,
        undefined,
        'FAST'
      )
      currentY += chartHeight + 10
    } catch {
      doc.setFontSize(10)
      doc.setTextColor(200)
      doc.text('Error al renderizar gráfico', margin, currentY)
      currentY += 20
    }
  }

  if (config.tables) {
    for (const table of config.tables) {
      if (currentY + 30 > pageHeight - margin) {
        doc.addPage()
        currentY = margin
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0)
      doc.text(table.title, margin, currentY)
      currentY += 8

      doc.autoTable({
        startY: currentY,
        head: [table.headers],
        body: table.rows,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      })

      currentY = doc.lastAutoTable.finalY + 10
    }
  }

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  return Buffer.from(doc.output('arraybuffer'))
}
