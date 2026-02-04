import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const protectedPaths = [
  '/dashboard',
  '/projects',
  '/finance',
  '/inventory',
  '/resources',
  '/suppliers',
  '/documents',
  '/reports',
  '/settings',
]

function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(es|en)/, '') || '/'
  return protectedPaths.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(p + '/')
  )
}

function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(es|en)/)
  return match?.[1] ?? routing.defaultLocale
}

// Run next-intl first; then protect routes using getToken (Edge-safe). Do not import
// @/lib/auth here—it pulls in bcrypt and Prisma, which break in the Edge runtime.
export default async function middleware(req: NextRequest) {
  const response = intlMiddleware(req)

  if (response.headers.get('x-middleware-rewrite') || response.status === 307 || response.status === 308) {
    return response
  }

  const pathname = req.nextUrl.pathname
  if (isProtectedPath(pathname)) {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      })
      if (!token) {
        const locale = getLocaleFromPath(pathname)
        const url = new URL(`/${locale}/login`, req.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
    } catch {
      // getToken can throw if NEXTAUTH_SECRET missing or invalid; let request through so layout can redirect
    }
  }

  return response
}

export const config = {
  matcher: [
    // Exclude api, _next, _vercel, static files (.*.), and /icon (favicon rewrite)
    '/((?!api|_next|_vercel|icon|.*\\..*).*)',
  ],
}
