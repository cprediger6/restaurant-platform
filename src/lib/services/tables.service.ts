// src/lib/services/tables.service.ts

//import 'server-only' // ✅ Esto asegura que solo se use en el servidor
import { prisma } from '@/lib/db/prisma-client'
import { TableStatus } from '@prisma/client'

export class TablesService {
  async getAllTables(companyId: string) {
    return await prisma.table.findMany({
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
      },
      orderBy: { number: 'asc' }
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

  async createTable(data: { number: string; capacity: number; location?: string; companyId: string }) {
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

    if (table.status === TableStatus.AVAILABLE) {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: TableStatus.OCCUPIED }
      })
    }

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
}