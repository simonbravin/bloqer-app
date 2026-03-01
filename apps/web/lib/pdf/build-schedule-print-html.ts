/**
 * Builds HTML for schedule PDF. Used by the PDF API so we don't rely on
 * fetching the print route (avoids 500 when session/cookies are lost in internal fetch).
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export type SchedulePrintLayoutData = {
  orgName: string
  orgLegalName?: string | null
  logoUrl?: string | null
  taxId?: string | null
  country?: string | null
  address?: string | null
  email?: string | null
  phone?: string | null
  userNameOrEmail?: string | null
}

export type SchedulePrintRow = {
  code: string
  name: string
  startDate: string
  endDate: string
  duration: number
  progress: string
}

export type SchedulePrintPageData = {
  projectName: string
  projectNumber?: string | null
  dateRangeSubtitle?: string
  rows: SchedulePrintRow[]
}

export type SchedulePrintOptions = {
  showEmitidoPor?: boolean
  showFullCompanyData?: boolean
}

export function buildSchedulePrintHtml(
  layout: SchedulePrintLayoutData,
  page: SchedulePrintPageData,
  options: SchedulePrintOptions = {}
): string {
  const { showEmitidoPor = true, showFullCompanyData = true } = options
  const displayName = (layout.orgLegalName || layout.orgName).trim() || '—'
  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const projectLine =
    layout.orgName && page.projectName
      ? page.projectName + (page.projectNumber ? ` (${page.projectNumber})` : '')
      : null
  const issuedLine =
    showEmitidoPor && layout.userNameOrEmail != null && layout.userNameOrEmail.trim() !== ''
      ? `Emitido por: ${esc(layout.userNameOrEmail.trim())}`
      : null

  const headerHtml = `
<header style="padding:0.75rem 1rem;margin-bottom:1rem;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;background:#f1f5f9;">
  <div style="min-width:0;max-width:70%;">
    ${showFullCompanyData && layout.logoUrl ? `<img src="${esc(layout.logoUrl)}" alt="" style="height:2.5rem;width:auto;object-fit:contain;margin-bottom:0.25rem;" />` : ''}
    <h1 style="font-size:1rem;font-weight:700;margin:0;color:#0f172a;">${esc(displayName)}</h1>
    ${projectLine ? `<p style="font-size:0.8125rem;color:#64748b;margin:0.25rem 0 0;">${esc(projectLine)}${page.dateRangeSubtitle ? esc(page.dateRangeSubtitle) : ''}</p>` : ''}
  </div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;font-size:0.75rem;color:#64748b;">
    <span>Fecha: ${esc(dateStr)}</span>
    ${issuedLine ? `<span>${esc(issuedLine)}</span>` : ''}
  </div>
</header>`

  const titleHtml = `<h2 style="font-size:1rem;font-weight:600;margin:0 0 0.75rem;">Cronograma</h2>`

  const rowPadding = '0.2rem 0.5rem'
  const tableFontSize = '0.75rem'
  const rowsHtml = page.rows.map(
    (r) => `<tr>
  <td style="padding:${rowPadding};border:1px solid #e2e8f0;font-size:${tableFontSize};">${esc(r.code)}</td>
  <td style="padding:${rowPadding};border:1px solid #e2e8f0;font-size:${tableFontSize};">${esc(r.name)}</td>
  <td style="padding:${rowPadding};border:1px solid #e2e8f0;font-size:${tableFontSize};">${esc(r.startDate)}</td>
  <td style="padding:${rowPadding};border:1px solid #e2e8f0;font-size:${tableFontSize};">${esc(r.endDate)}</td>
  <td style="padding:${rowPadding};border:1px solid #e2e8f0;font-size:${tableFontSize};text-align:right;">${r.duration}</td>
  <td style="padding:${rowPadding};border:1px solid #e2e8f0;font-size:${tableFontSize};text-align:center;">${esc(r.progress)}</td>
</tr>`
  )

  const tableHtml = `
<table style="width:100%;border-collapse:collapse;">
  <thead>
    <tr>
      <th style="padding:${rowPadding};border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;font-size:${tableFontSize};text-align:left;">Código</th>
      <th style="padding:${rowPadding};border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;font-size:${tableFontSize};text-align:left;">Actividad</th>
      <th style="padding:${rowPadding};border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;font-size:${tableFontSize};text-align:left;">Inicio</th>
      <th style="padding:${rowPadding};border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;font-size:${tableFontSize};text-align:left;">Fin</th>
      <th style="padding:${rowPadding};border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;font-size:${tableFontSize};text-align:right;">Duración (días)</th>
      <th style="padding:${rowPadding};border:1px solid #e2e8f0;background:#f1f5f9;font-weight:600;font-size:${tableFontSize};text-align:center;">Avance %</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml.join('')}
  </tbody>
</table>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cronograma</title>
</head>
<body style="margin:0;padding:1rem;font-family:system-ui,sans-serif;color:#0f172a;">
  ${headerHtml}
  ${titleHtml}
  ${page.rows.length === 0 && page.dateRangeSubtitle ? `<p style="font-size:0.875rem;color:#64748b;">No hay tareas en el período seleccionado.</p>` : ''}
  ${page.rows.length > 0 ? tableHtml : ''}
</body>
</html>`
}
