/**
 * Serves the Bloqer favicon from public/icon.png.
 * /favicon.ico is rewritten to /icon in next.config.
 */
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const iconPath = path.join(process.cwd(), 'public', 'icon.png')
    const buffer = await readFile(iconPath)
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    // Fallback minimal 1x1 PNG if file missing
    const fallback = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    return new Response(fallback, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
    })
  }
}
