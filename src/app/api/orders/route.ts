// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dinerId = searchParams.get('dinerId')
    const status = searchParams.get('status') as OrderStatus | null

    if (!dinerId) {
      return NextResponse.json(
        { error: 'Se requiere dinerId' },
        { status: 400 }
      )
    }

    const where: any = { dinerId }
    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            },
            variant: true
          }
        },
        diner: {
          include: {
            table: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dinerId, notes } = body

    if (!dinerId) {
      return NextResponse.json(
        { error: 'Se requiere dinerId' },
        { status: 400 }
      )
    }

    const diner = await prisma.diner.findUnique({
      where: { id: dinerId },
      include: { table: true }
    })

    if (!diner || !diner.active) {
      return NextResponse.json(
        { error: 'Comensal no encontrado o inactivo' },
        { status: 404 }
      )
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        dinerId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.IN_PREPARATION, OrderStatus.READY]
        }
      }
    })

    if (existingOrder) {
      return NextResponse.json(
        { error: 'El comensal ya tiene un pedido activo' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        dinerId,
        status: OrderStatus.PENDING,
        total: 0,
        notes: notes || ''
      },
      include: {
        items: true,
        diner: {
          include: {
            table: true
          }
        }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/orders:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al crear pedido' },
      { status: 500 }
    )
  }
}