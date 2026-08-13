// src/app/api/tables/[id]/status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { TablesService } from '@/lib/services/tables.service'
import { TableStatus } from '@prisma/client'

const tablesService = new TablesService()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiar a Promise
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status } = body

    if (!Object.values(TableStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // ✅ Usar await en params
    const { id } = await params

    const table = await tablesService.updateTableStatus(id, status)
    return NextResponse.json(table)
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar estado' },
      { status: 400 }
    )
  }
}