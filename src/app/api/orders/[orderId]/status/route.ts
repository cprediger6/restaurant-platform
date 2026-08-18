// src/app/api/orders/[orderId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { OrderStatus } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere orderId' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
      [OrderStatus.IN_PREPARATION]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.BILLED],
      [OrderStatus.BILLED]: [],
      [OrderStatus.CANCELLED]: []
    }

    if (!transitions[order.status]?.includes(status)) {
      return NextResponse.json(
        { error: `No se puede cambiar de ${order.status} a ${status}` },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    await prisma.orderAudit.create({
      data: {
        orderId: orderId,
        action: 'STATUS_CHANGED',
        description: `Estado cambiado a: ${status}`,
        details: {
          oldStatus: order.status,
          newStatus: status
        },
        userId: 'system'
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error en PUT /api/orders/[orderId]/status:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al actualizar estado del pedido' },
      { status: 500 }
    )
  }
}