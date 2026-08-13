// src/lib/auth/auth.config.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma-client";
import { compare } from "bcryptjs";

// ============================================================
// TIPOS
// ============================================================

interface Permission {
  id: string;
  userId: string;
  module: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
  canPrint: boolean;
  canViewCost: boolean;
}

// ============================================================
// EXTENDER TIPOS DE NEXTAUTH
// ============================================================

declare module "next-auth" {
  interface User {
    role: string;
    companyId: string;
    companyName: string;
    permissions: Permission[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyId: string;
      companyName: string;
      permissions: Permission[];
    };
  }

  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    companyName?: string;
    permissions?: Permission[];
  }
}

// ============================================================
// CONFIGURACIÓN PRINCIPAL
// ============================================================

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ============================================================
        // 1. VALIDAR CREDENCIALES
        // ============================================================
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [Auth] Credenciales faltantes");
          return null;
        }

        try {
          console.log(`🔐 [Auth] Intentando login: ${credentials.email}`);

          // ============================================================
          // 2. BUSCAR USUARIO
          // ============================================================
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { company: true },
          });

          if (!user) {
            console.log(`❌ [Auth] Usuario no encontrado: ${credentials.email}`);
            return null;
          }

          if (!user.password) {
            console.log(`❌ [Auth] Usuario sin contraseña: ${credentials.email}`);
            return null;
          }

          // ============================================================
          // 3. VERIFICAR CONTRASEÑA
          // ============================================================
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.log(`❌ [Auth] Contraseña incorrecta: ${credentials.email}`);
            return null;
          }

          // ============================================================
          // 4. VERIFICAR USUARIO ACTIVO
          // ============================================================
          if (!user.isActive) {
            console.log(`❌ [Auth] Usuario inactivo: ${credentials.email}`);
            return null;
          }

          console.log(`✅ [Auth] Login exitoso: ${credentials.email}`);

          // ============================================================
          // 5. RETORNAR USUARIO
          // ============================================================
          return {
            id: user.id,
            email: user.email,
            name: `${user.name} ${user.lastName}`.trim(),
            role: user.role,
            companyId: user.companyId,
            companyName: user.company?.name || "",
            permissions: [],
          };
        } catch (error) {
          console.error("❌ [Auth] Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  // ============================================================
  // CALLBACKS
  // ============================================================

  callbacks: {
    async jwt({ token, user }) {
      console.log("🔄 [JWT] Callback ejecutado:", {
        hasUser: !!user,
        tokenId: token.id,
        tokenRole: token.role,
      });

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.permissions = user.permissions;
      }

      return token;
    },

    async session({ session, token }) {
      console.log("🔄 [Session] Callback ejecutado:", {
        hasToken: !!token,
        tokenId: token.id,
        tokenRole: token.role,
        sessionUser: session.user?.email,
      });

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
        session.user.permissions = token.permissions as Permission[];
      }

      return session;
    },
  },

  // ============================================================
  // PÁGINAS PERSONALIZADAS
  // ============================================================

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ============================================================
  // CONFIGURACIÓN DE SESIÓN
  // ============================================================

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  // ============================================================
  // CONFIGURACIÓN DE COOKIES (PRODUCCIÓN)
  // ============================================================

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Para Vercel, no es necesario especificar domain
        // domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined,
      },
    },
  },

  // ============================================================
  // SECRET
  // ============================================================

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,

  // ============================================================
  // DEBUG (solo en desarrollo)
  // ============================================================

  debug: process.env.NODE_ENV === "development",
};

// ============================================================
// EXPORTAR CONFIGURACIÓN
// ============================================================

export default authOptions;