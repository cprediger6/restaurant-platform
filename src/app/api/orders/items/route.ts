// src/app/api/orders/items/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { OrderStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, productId, variantId, quantity, unitPrice, notes, userId } = body

    if (!orderId || !productId || !quantity || !unitPrice) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { diner: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json(
        { error: 'El pedido no está en estado pendiente' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const subtotal = unitPrice * quantity

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        productId,
        variantId,
        quantity,
        unitPrice,
        subtotal,
        notes: notes || ''
      },
      include: {
        product: {
          include: {
            category: true
          }
        },
        variant: true
      }
    })

    const allItems = await prisma.orderItem.findMany({
      where: { orderId }
    })

    const total = allItems.reduce((sum, item) => sum + item.subtotal, 0)

    await prisma.order.update({
      where: { id: orderId },
      data: { total }
    })

    await prisma.orderAudit.create({
      data: {
        orderId,
        action: 'ITEM_ADDED',
        description: `Agregado: ${product.name} x${quantity}`,
        details: {
          productId,
          quantity,
          unitPrice,
          notes: notes || '',
          subtotal
        },
        userId: undefined as any
      }
    })

    return NextResponse.json(orderItem, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/orders/items:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al agregar item al pedido' },
      { status: 500 }
    )
  }
}