// src/app/api/products/[id]/route.ts

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

    const product = await productService.getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (product.companyId !== session.user.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error en GET /api/products/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

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

    // Verificar SKU único
    if (body.sku) {
      const skuAvailable = await productService.checkSkuAvailability(
        body.sku,
        params.id
      )
      if (!skuAvailable) {
        return NextResponse.json(
          { error: 'El SKU ya está en uso' },
          { status: 400 }
        )
      }
    }

    const product = await productService.updateProduct(params.id, body)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error en PUT /api/products/[id]:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
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

    const result = await productService.deleteProduct(params.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en DELETE /api/products/[id]:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}