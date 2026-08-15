// src/lib/db/prisma-client.ts

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Configuración para Prisma Accelerate o conexión directa
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Si usas Prisma Accelerate, usa esta configuración
// const accelerateUrl = process.env.PRISMA_ACCELERATE_URL

// Configuración para conexión directa con Driver Adapter
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en el archivo .env')
}

// Crear pool de conexiones para PostgreSQL
const pool = new Pool({ 
  connectionString,
  // Configuración adicional para NeonDB
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Crear adaptador
const adapter = new PrismaPg(pool)

// Crear instancia de PrismaClient con el adaptador
export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  // Si usas Prisma Accelerate, usa:
  // accelerateUrl: process.env.PRISMA_ACCELERATE_URL
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma