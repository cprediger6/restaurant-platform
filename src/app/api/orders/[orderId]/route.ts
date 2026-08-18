// src/app/api/orders/[orderId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { OrderStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    console.log('📦 [GET] /api/orders/[orderId] - orderId:', orderId)

    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere orderId' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
            table: true,
            allergies: {
              include: {
                allergen: true
              }
            }
          }
        },
        payments: true,
        audit: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error en GET /api/orders/[orderId]:', error)
    return NextResponse.json(
      { error: 'Error al obtener pedido', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    console.log('📦 [PUT] /api/orders/[orderId] - orderId:', orderId)

    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere orderId' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    if (order.status === OrderStatus.BILLED) {
      return NextResponse.json(
        { error: 'No se puede modificar un pedido facturado' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No se especificó qué actualizar' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    if (body.notes !== undefined) {
      await prisma.orderAudit.create({
  data: {
    orderId: orderId,
    action: 'NOTES_UPDATED',
    description: 'Notas del pedido actualizadas',
    details: {
      oldNotes: order.notes,
      newNotes: body.notes
    },
    userId: undefined as any// ✅ Debe ser null
  }
})
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error en PUT /api/orders/[orderId]:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al actualizar pedido' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    if (order.status === OrderStatus.BILLED) {
      return NextResponse.json(
        { error: 'No se puede eliminar un pedido facturado' },
        { status: 400 }
      )
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    })

    await prisma.orderAudit.deleteMany({
      where: { orderId: orderId }
    })

    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/orders/[orderId]:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al eliminar pedido' },
      { status: 500 }
    )
  }
}