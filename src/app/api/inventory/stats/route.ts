// src/app/api/inventory/stats/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'

type TopProduct = {
  id: string
  name: string
  sku: string
  quantity: number
  revenue: number
}

type RecentMovement = {
  id: string
  type: string
  quantity: number
  unitCost: number
  totalCost: number
  createdAt: Date
  inventoryItem: {
    product: {
      id: string
      name: string
      sku: string
    }
    variant: {
      id: string
      name: string
      value: string
    } | null
  }
  user: {
    id: string
    name: string
  } | null
}

export async function GET() {
  try {
    // 1. Estadísticas básicas
    const [totalItems, lowStockItems, movementsLastMonth, totalValue] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({
        where: {
          currentStock: {
            lte: 10,
          },
        },
      }),
      prisma.inventoryMovement.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.inventoryItem.aggregate({
        _sum: {
          currentStock: true,
        },
      }),
    ])

    // 2. Productos más vendidos usando Prisma (evitamos SQL directo)
    let topProducts: TopProduct[] = []
    try {
      // Primero, agrupamos por productoId en OrderItem
      const grouped = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
          subtotal: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
        where: {
          order: {
            status: {
              not: 'CANCELLED',
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      })

      if (grouped.length > 0) {
        const productIds = grouped.map((item) => item.productId)
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, sku: true },
        })

        topProducts = grouped.map((item) => {
          const product = products.find((p) => p.id === item.productId)
          return {
            id: item.productId,
            name: product?.name || 'Desconocido',
            sku: product?.sku || '',
            quantity: Number(item._sum.quantity) || 0,
            revenue: Number(item._sum.subtotal) || 0,
          }
        })
      }
    } catch (error) {
      console.warn('Error fetching top products:', error)
      topProducts = []
    }

    // 3. Movimientos recientes
    let recentMovements: RecentMovement[] = []
    try {
      const rawMovements = await prisma.inventoryMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          inventoryItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  value: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      recentMovements = rawMovements as RecentMovement[]
    } catch (error) {
      console.warn('Error fetching recent movements:', error)
      recentMovements = []
    }

    // 4. Cálculos de rotación
    const turnoverRate = totalItems > 0 ? (movementsLastMonth / totalItems) * 12 : 0
    const averageDaysInventory = turnoverRate > 0 ? 365 / turnoverRate : 0

    const responseData = {
      totalItems: Number(totalItems) || 0,
      totalValue: Number(totalValue._sum?.currentStock) || 0,
      lowStockItems: Number(lowStockItems) || 0,
      movementsLastMonth: Number(movementsLastMonth) || 0,
      turnoverRate: Number(turnoverRate.toFixed(2)) || 0,
      averageDaysInventory: Number(averageDaysInventory.toFixed(0)) || 0,
      topProducts,
      recentMovements,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching inventory stats:', error)
    return NextResponse.json(
      {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        movementsLastMonth: 0,
        turnoverRate: 0,
        averageDaysInventory: 0,
        topProducts: [],
        recentMovements: [],
        _error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 200 }
    )
  }
}