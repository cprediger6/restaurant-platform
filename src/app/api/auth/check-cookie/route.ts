// src/app/api/auth/check-cookie/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las cookies
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader.split(";").map(c => c.trim());
    
    // Buscar cookies de sesión
    const sessionCookie = cookies.find(c => 
      c.startsWith("next-auth.session-token") || 
      c.startsWith("__Secure-next-auth.session-token")
    );

    // Intentar obtener la sesión
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      hasSessionCookie: !!sessionCookie,
      sessionCookieName: sessionCookie?.split("=")[0] || "none",
      session: session ? {
        authenticated: true,
        user: {
          email: session.user?.email,
          role: session.user?.role,
        }
      } : null,
      allCookies: cookies,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Error desconocido",
    }, { status: 500 });
  }
}