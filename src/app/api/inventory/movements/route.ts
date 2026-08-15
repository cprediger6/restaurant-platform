// src/app/api/inventory/movements/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const inventoryItemId = searchParams.get('inventoryItemId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')

    const where: any = {}

    if (inventoryItemId) {
      where.inventoryItemId = inventoryItemId
    }

    if (startDate) {
      where.createdAt = { gte: new Date(startDate) }
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
    }

    if (type) {
      where.type = type
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        inventoryItem: {
          include: {
            product: true,
            variant: true,
            warehouse: true
          }
        },
        sourceWarehouse: true,
        targetWarehouse: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json(movements)
  } catch (error) {
    console.error('Error en GET /api/inventory/movements:', error)
    return NextResponse.json(
      { error: 'Error al obtener movimientos' },
      { status: 500 }
    )
  }
}