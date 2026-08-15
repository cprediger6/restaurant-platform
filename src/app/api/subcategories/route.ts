// src/app/api/subcategories/route.ts

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
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Se requiere categoryId' },
        { status: 400 }
      )
    }

    const subcategories = await productService.getSubcategories(categoryId)
    return NextResponse.json(subcategories)
  } catch (error) {
    console.error('Error en GET /api/subcategories:', error)
    return NextResponse.json(
      { error: 'Error al obtener subcategorías' },
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
    const subcategory = await productService.createSubcategory(body)

    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/subcategories:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error al crear subcategoría' },
      { status: 500 }
    )
  }
}