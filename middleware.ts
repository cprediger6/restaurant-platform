// src/middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ✅ TODAS las rutas de API deben ser públicas
    const publicPaths = [
      '/login',
      '/api/auth',           // ✅ Todas las rutas de auth
      '/api/auth/callback',
      '/api/auth/session',
      '/api/auth/providers',
      '/api/auth/signin',
      '/api/auth/error',
      '/api/auth/_log',
      '/_next',               // ✅ Recursos de Next.js
      '/favicon.ico',
    ];
    
    const isPublicPath = publicPaths.some(p => path.startsWith(p));

    // ✅ Siempre permitir rutas públicas
    if (isPublicPath) {
      return NextResponse.next();
    }

    // ✅ Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
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
    // ✅ Excluir explícitamente las rutas de auth y recursos estáticos
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)',
  ],
};