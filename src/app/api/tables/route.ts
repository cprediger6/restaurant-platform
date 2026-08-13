// src/app/api/tables/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { TablesService } from '@/lib/services/tables.service'

const tablesService = new TablesService()

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const companyId = session.user.companyId
  const searchParams = request.nextUrl.searchParams
  const isStats = searchParams.get('stats') === 'true'

  try {
    if (isStats) {
      const stats = await tablesService.getTableStats(companyId)
      return NextResponse.json(stats)
    }

    const tables = await tablesService.getAllTables(companyId)
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error en GET /api/tables:', error)
    return NextResponse.json(
      { error: 'Error al obtener mesas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { number, capacity, location } = body

    const table = await tablesService.createTable({
      number,
      capacity,
      location,
      companyId: session.user.companyId
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error en POST /api/tables:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear mesa' },
      { status: 400 }
    )
  }
}