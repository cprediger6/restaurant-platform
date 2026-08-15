// src/app/api/diners/[id]/orders/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { OrderService } from '@/lib/services/orders.service'

const orderService = new OrderService()

// GET - Obtener pedidos del comensal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const orders = await orderService.getOrdersByDiner(id)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error en GET /api/diners/[id]/orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener pedidos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo pedido para el comensal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const order = await orderService.createOrder(id)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/diners/[id]/orders:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear pedido' },
      { status: 400 }
    )
  }
}