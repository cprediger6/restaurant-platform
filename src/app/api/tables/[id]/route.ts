// src/app/api/diners/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { TablesService } from '@/lib/services/tables.service'

const tablesService = new TablesService()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Cambiar a Promise
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // ✅ Usar await en params
    const { id } = await params

    const result = await tablesService.removeDiner(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error al retirar comensal:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al retirar comensal' },
      { status: 400 }
    )
  }
}