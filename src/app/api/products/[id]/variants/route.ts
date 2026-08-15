// src/app/api/products/[id]/variants/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const variants = await productService.getVariants(params.id)
    return NextResponse.json(variants)
  } catch (error) {
    console.error('Error en GET /api/products/[id]/variants:', error)
    return NextResponse.json(
      { error: 'Error al obtener variantes' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const variant = await productService.createVariant({
      ...body,
      productId: params.id,
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/products/[id]/variants:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al crear variante' },
      { status: 500 }
    )
  }
}