// src/app/api/tables/[id]/diners/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { TablesService } from '@/lib/services/tables.service'

const tablesService = new TablesService()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = body

    const diner = await tablesService.addDiner(params.id, name)
    return NextResponse.json(diner)
  } catch (error) {
    console.error('Error al agregar comensal:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al agregar comensal' },
      { status: 400 }
    )
  }
}