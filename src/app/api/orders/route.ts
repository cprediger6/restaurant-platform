// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { OrderService } from '@/lib/services/orders.service'

const orderService = new OrderService()

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const dinerId = searchParams.get('dinerId')

  if (!dinerId) {
    return NextResponse.json(
      { error: 'dinerId es requerido' },
      { status: 400 }
    )
  }

  try {
    const orders = await orderService.getOrdersByDiner(dinerId)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { dinerId } = body

    if (!dinerId) {
      return NextResponse.json(
        { error: 'dinerId es requerido' },
        { status: 400 }
      )
    }

    const order = await orderService.createOrder(dinerId)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear pedido' },
      { status: 400 }
    )
  }
}