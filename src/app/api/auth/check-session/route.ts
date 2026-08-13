// src/app/api/auth/check-session/route.ts

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth.config"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 [Check Session] Session:', session)
    
    if (!session) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'No hay sesión activa' 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: session.user,
      message: 'Sesión activa' 
    })
  } catch (error) {
    console.error('❌ [Check Session] Error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Error al verificar sesión' 
    }, { status: 500 })
  }
}