// src/app/api/inventory/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const warehouse = searchParams.get('warehouse') || ''
    const minStock = searchParams.get('minStock')
    const maxStock = searchParams.get('maxStock')
    const status = searchParams.get('status') || 'all'

    const where: any = {}

    if (warehouse) {
      where.warehouseId = warehouse
    }

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
        { product: { internalCode: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (category) {
      where.product = { categoryId: category }
    }

    if (minStock) {
      where.currentStock = { gte: parseFloat(minStock) }
    }
    if (maxStock) {
      where.currentStock = { ...where.currentStock, lte: parseFloat(maxStock) }
    }

    if (status === 'low') {
      where.currentStock = { lte: 10 }
    } else if (status === 'high') {
      where.currentStock = { gte: 100 }
    }

    const skip = (page - 1) * limit

    const [items, totalItems] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          product: {
            include: {
              category: true
            }
          },
          variant: true,
          warehouse: true,
          location: true
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventoryItem.count({ where })
    ])

    return NextResponse.json({
      items: items || [],
      totalItems: totalItems || 0,
      totalPages: Math.ceil((totalItems || 0) / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error en GET /api/inventory:', error)
    return NextResponse.json(
      { 
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        error: 'Error al obtener inventario'
      },
      { status: 500 }
    )
  }
}