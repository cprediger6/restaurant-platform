// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { productService } from '@/lib/services/product.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const isActive = searchParams.get('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined

    const result = await productService.getProducts({
      page,
      limit,
      search,
      categoryId,
      isActive,
      companyId: session.user.companyId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en GET /api/products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    // Validar SKU único
    const skuAvailable = await productService.checkSkuAvailability(body.sku)
    if (!skuAvailable) {
      return NextResponse.json(
        { error: 'El SKU ya está en uso' },
        { status: 400 }
      )
    }

    const product = await productService.createProduct({
      ...body,
      companyId: session.user.companyId,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/products:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}