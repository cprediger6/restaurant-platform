// src/app/api/orders/[orderId]/items/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { OrderService } from '@/lib/services/orders.service'

const orderService = new OrderService()

// POST - Agregar item al pedido
export async function POST(
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
    const { productId, variantId, quantity, notes, unitPrice } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'productId y quantity son requeridos' },
        { status: 400 }
      )
    }

    const result = await orderService.addOrderItem({
      orderId,
      productId,
      variantId,
      quantity,
      notes,
      unitPrice
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/orders/[orderId]/items:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al agregar item' },
      { status: 400 }
    )
  }
}