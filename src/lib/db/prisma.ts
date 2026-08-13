// src/lib/db/prisma.ts

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Verificar que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno')
}

// Crear el adaptador para Neon
const adapter = new PrismaNeon({ 
  connectionString: process.env.DATABASE_URL 
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma