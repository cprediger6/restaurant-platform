// src/middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ✅ Rutas públicas - incluir TODAS las rutas de auth
    const publicPaths = [
      '/login',
      '/api/auth',
      '/api/auth/session',
      '/api/auth/providers',
      '/api/auth/callback',
      '/api/auth/signin',
      '/api/auth/error',
      '/api/auth/_log',
    ];
    
    const isPublicPath = publicPaths.some(p => path.startsWith(p));

    // Si es una ruta pública, permitir acceso
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Proteger rutas de API
    if (path.startsWith('/api')) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // ✅ Permitir acceso solo si hay token
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    // ✅ Excluir explícitamente las rutas de auth
    '/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)',
  ]
};