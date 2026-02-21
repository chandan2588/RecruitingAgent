import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Get connection string from env
  let connectionString = process.env.DATABASE_URL || ''
  
  // For Neon connections (postgresql:// or postgres://), use as-is
  // For prisma+postgres:// (local dev), convert to TCP
  if (connectionString.startsWith('prisma+postgres://')) {
    connectionString = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
  }
  
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
