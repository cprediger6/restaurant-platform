// src/middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("🔍 [Middleware] Path:", path);
    console.log("🔍 [Middleware] Token existe:", !!token);

    // Rutas públicas
    const publicPaths = [
      '/login',
      '/api/auth',
      '/api/auth/callback',
      '/api/auth/session',
      '/api/auth/providers',
      '/api/auth/signin',
      '/api/auth/error',
      '/api/test-db',
    ];
    
    const isPublicPath = publicPaths.some(p => path.startsWith(p));

    if (isPublicPath) {
      return NextResponse.next();
    }

    if (!token) {
      console.log("🔴 [Middleware] Redirigiendo a login");
      return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log("✅ [Middleware] Acceso permitido");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)',
  ],
};