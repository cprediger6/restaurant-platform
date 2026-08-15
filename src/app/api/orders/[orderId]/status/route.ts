// src/app/api/orders/[orderId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { OrderService } from '@/lib/services/orders.service'
import { OrderStatus } from '@prisma/client'

const orderService = new OrderService()

// PATCH - Actualizar estado del pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { orderId } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const order = await orderService.updateOrderStatus(orderId, status)
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error en PATCH /api/orders/[orderId]/status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar estado' },
      { status: 400 }
    )
  }
}