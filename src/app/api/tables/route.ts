// src/app/api/tables/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { TablesService } from '@/lib/services/tables.service'

const tablesService = new TablesService()

// GET - Obtener todas las mesas o estadísticas
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const isStats = searchParams.get('stats') === 'true'

  try {
    if (isStats) {
      const stats = await tablesService.getTableStats(session.user.companyId)
      return NextResponse.json(stats)
    }

    const tables = await tablesService.getAllTables(session.user.companyId)
    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error en GET /api/tables:', error)
    return NextResponse.json(
      { error: 'Error al obtener mesas' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva mesa
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('📝 [API] Recibido:', body)

    const { number, capacity, location } = body

    if (!number || !capacity) {
      return NextResponse.json(
        { error: 'Número y capacidad son requeridos' },
        { status: 400 }
      )
    }

    const table = await tablesService.createTable({
      number,
      capacity: Number(capacity),
      location,
      companyId: session.user.companyId
    })

    console.log('✅ [API] Mesa creada:', table)
    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear mesa' },
      { status: 400 }
    )
  }
}

// DELETE - Eliminar una mesa
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const tableId = searchParams.get('id')

    if (!tableId) {
      return NextResponse.json(
        { error: 'ID de mesa requerido' },
        { status: 400 }
      )
    }

    const result = await tablesService.deleteTable(tableId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en DELETE /api/tables:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar mesa' },
      { status: 400 }
    )
  }
}