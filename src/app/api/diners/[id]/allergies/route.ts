// src/app/api/diners/[id]/allergies/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { OrderService } from '@/lib/services/orders.service'

const orderService = new OrderService()

// GET - Obtener alérgenos del comensal
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
    const allergies = await orderService.getDinerAllergies(id)
    return NextResponse.json(allergies)
  } catch (error) {
    console.error('Error en GET /api/diners/[id]/allergies:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener alérgenos' },
      { status: 500 }
    )
  }
}

// POST - Agregar alérgeno al comensal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { allergenId, notes } = body

    if (!allergenId) {
      return NextResponse.json(
        { error: 'allergenId es requerido' },
        { status: 400 }
      )
    }

    const allergy = await orderService.addDinerAllergy(id, allergenId, notes)
    return NextResponse.json(allergy, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/diners/[id]/allergies:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al agregar alérgeno' },
      { status: 400 }
    )
  }
}

// DELETE - Eliminar alérgeno del comensal
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
    const searchParams = request.nextUrl.searchParams
    const allergenId = searchParams.get('allergenId')

    if (!allergenId) {
      return NextResponse.json(
        { error: 'allergenId es requerido' },
        { status: 400 }
      )
    }

    await orderService.removeDinerAllergy(id, allergenId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/diners/[id]/allergies:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar alérgeno' },
      { status: 400 }
    )
  }
}