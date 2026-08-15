// src/app/api/variants/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const variant = await productService.updateVariant(params.id, body)

    return NextResponse.json(variant)
  } catch (error) {
    console.error('Error en PUT /api/variants/[id]:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al actualizar variante' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await productService.deleteVariant(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/variants/[id]:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al eliminar variante' },
      { status: 500 }
    )
  }
}