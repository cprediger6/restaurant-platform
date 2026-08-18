// src/app/api/orders/items/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { orderService } from '@/lib/services/orders.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    const result = await orderService.addOrderItem({
      orderId: body.orderId,
      productId: body.productId,
      variantId: body.variantId,
      quantity: body.quantity,
      notes: body.notes || '', // ✅ Incluir notas del item
      unitPrice: body.unitPrice,
      userId: session.user.id
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/orders/items:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al agregar item' },
      { status: 500 }
    )
  }
}