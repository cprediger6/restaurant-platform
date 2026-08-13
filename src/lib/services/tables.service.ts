// src/lib/services/tables.service.ts

import 'server-only'
import { prisma } from '@/lib/db/prisma-client'
import { TableStatus } from '@prisma/client'

export class TablesService {
  // src/lib/services/tables.service.ts

async getAllTables(companyId: string) {
  const tables = await prisma.table.findMany({
    where: { companyId },
    include: {
      diners: {
        where: { active: true },
        include: {
          orders: {
            where: { status: { not: 'BILLED' } },
            include: {
              items: true
            }
          }
        }
      }
    }
  })

  // ✅ Ordenar numéricamente: 1, 2, 3, 4... 10, 11
  return tables.sort((a, b) => {
    const numA = parseInt(a.number)
    const numB = parseInt(b.number)
    
    // Si ambos son números, ordenar numéricamente
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }
    
    // Si uno es número y otro no, los números primero
    if (!isNaN(numA)) return -1
    if (!isNaN(numB)) return 1
    
    // Si ambos son texto, ordenar alfabéticamente
    return a.number.localeCompare(b.number)
  })
}

  async getTableById(tableId: string) {
    return await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        diners: {
          where: { active: true },
          include: {
            orders: {
              where: { status: { not: 'BILLED' } },
              include: {
                items: {
                  include: {
                    product: true,
                    variant: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  // src/lib/services/tables.service.ts

async createTable(data: { number: string; capacity: number; location?: string; companyId: string }) {
  // Validar que no exista una mesa con el mismo número
  const existing = await prisma.table.findFirst({
    where: {
      number: data.number,
      companyId: data.companyId
    }
  })

  if (existing) {
    throw new Error(`Ya existe una mesa con el número ${data.number}`)
  }

  return await prisma.table.create({
    data: {
      number: data.number,
      capacity: data.capacity,
      location: data.location,
      companyId: data.companyId,
      status: TableStatus.AVAILABLE
    }
  })
}

  async updateTableStatus(tableId: string, status: TableStatus) {
    return await prisma.table.update({
      where: { id: tableId },
      data: { status }
    })
  }

  async addDiner(tableId: string, name?: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId }
  })

  if (!table) {
    throw new Error('Mesa no encontrada')
  }

  // ✅ Solo cambia a OCCUPIED si está AVAILABLE
  if (table.status === TableStatus.AVAILABLE) {
    await prisma.table.update({
      where: { id: tableId },
      data: { status: TableStatus.OCCUPIED }
    })
  }

  // ✅ Siempre crea un nuevo comensal, sin importar cuántos ya existan
  return await prisma.diner.create({
    data: {
      tableId,
      name: name || `Comensal ${new Date().toLocaleTimeString()}`
    }
  })
}

  async removeDiner(dinerId: string) {
    const diner = await prisma.diner.findUnique({
      where: { id: dinerId },
      include: { table: true }
    })

    if (!diner) {
      throw new Error('Comensal no encontrado')
    }

    const activeOrders = await prisma.order.findFirst({
      where: {
        dinerId: dinerId,
        status: { not: 'BILLED' }
      }
    })

    if (activeOrders) {
      throw new Error('El comensal tiene pedidos activos')
    }

    await prisma.diner.update({
      where: { id: dinerId },
      data: { active: false }
    })

    const remainingDiners = await prisma.diner.count({
      where: {
        tableId: diner.tableId,
        active: true
      }
    })

    if (remainingDiners === 0) {
      await prisma.table.update({
        where: { id: diner.tableId },
        data: { status: TableStatus.AVAILABLE }
      })
    }

    return { success: true, message: 'Comensal retirado correctamente' }
  }

  async getTableStats(companyId: string) {
    const tables = await prisma.table.findMany({
      where: { companyId },
      include: {
        diners: {
          where: { active: true }
        }
      }
    })

    const total = tables.length
    const available = tables.filter(t => t.status === TableStatus.AVAILABLE).length
    const occupied = tables.filter(t => t.status === TableStatus.OCCUPIED).length
    const totalDiners = tables.reduce((acc, t) => acc + t.diners.length, 0)

    return { total, available, occupied, totalDiners }
  }

  async deleteTable(tableId: string) {
    // Verificar que no tenga comensales activos
    const activeDiners = await prisma.diner.count({
      where: {
        tableId,
        active: true
      }
    })

    if (activeDiners > 0) {
      throw new Error('No se puede eliminar una mesa con comensales activos')
    }

    return await prisma.table.delete({
      where: { id: tableId }
    })
  }
}