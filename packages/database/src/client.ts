import { PrismaClient } from '@prisma/client'

// Neon–Vercel integration sets DATABASE_URL_UNPOOLED; Prisma expects DIRECT_URL
if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL_UNPOOLED?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED
}

// Fail fast in production if DB is not configured (avoids cryptic Prisma connection errors)
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.trim()) {
  const vercelEnv = process.env.VERCEL_ENV ?? 'production'
  throw new Error(
    `DATABASE_URL is required in production. In Vercel: Project Settings → Environment Variables → add DATABASE_URL and DIRECT_URL for "${vercelEnv}" (and "Production" if you use portal.bloqer.app). Value = raw URL only, e.g. postgresql://user:pass@host/db?sslmode=require — no "psql '" prefix or trailing quotes. Save and redeploy.`
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
