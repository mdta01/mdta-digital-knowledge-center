import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client singleton.
 *
 * In development: cached on globalThis to survive HMR.
 * In production (Vercel serverless): each function invocation gets its own
 * PrismaClient instance, but warm invocations reuse the cached global.
 *
 * Connection pool tuning for Supabase Transaction Pooler (PgBouncer):
 * - Set `?pgbouncer=true&connection_limit=1` in DATABASE_URL
 * - This file doesn't override pool settings (they come from the URL).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors in production; log queries in dev for debugging.
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
