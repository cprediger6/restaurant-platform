// src/lib/auth/auth.config.ts

import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyId: string;
      companyName: string;
      permissions: any;
    }
  }

  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    companyName?: string;
    permissions?: any;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.role = u.role;
        token.companyId = u.companyId;
        token.companyName = u.companyName;
        token.permissions = u.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  // ✅ CONFIGURACIÓN DE COOKIES - FORZADA para Vercel
  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token", // ⚠️ Sin __Secure para probar
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        // ⚠️ NO usar domain en Vercel
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: true,
};