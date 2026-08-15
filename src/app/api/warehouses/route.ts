// src/app/api/warehouses/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'Error al obtener bodegas' },
      { status: 500 }
    )
  }
}