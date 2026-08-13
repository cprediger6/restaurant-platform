// src/middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log("🔍 [Middleware] Path:", path);
    console.log("🔍 [Middleware] Token:", !!token);

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
      '/api/auth/check-cookie',
      '/api/auth/debug-set-cookie',
    ];
    
    const isPublicPath = publicPaths.some(p => path.startsWith(p));

    if (isPublicPath) {
      const response = NextResponse.next();
      // ✅ Headers de seguridad para cookies
      response.headers.set(
        "Set-Cookie",
        "test-cookie=test; Path=/; HttpOnly; Secure; SameSite=Lax"
      );
      return response;
    }

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("🔍 [Middleware authorized] Token:", !!token);
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