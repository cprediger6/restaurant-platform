// src/app/api/tables/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { TablesService } from '@/lib/services/tables.service'

const tablesService = new TablesService()

// GET - Obtener una mesa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const table = await tablesService.getTableById(id)
    
    if (!table) {
      return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
    }

    // Verificar que la mesa pertenece a la compañía del usuario
    if (table.companyId !== session.user.companyId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error en GET /api/tables/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener la mesa' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una mesa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const result = await tablesService.deleteTable(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en DELETE /api/tables/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar mesa' },
      { status: 400 }
    )
  }
}