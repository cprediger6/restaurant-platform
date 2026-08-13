// src/lib/auth/auth.config.ts

import { NextAuthOptions } from "next-auth";

// ✅ Definir tipos específicos
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

interface ExtendedUser {
  id: string;
  role: string;
  companyId: string;
  companyName: string;
  permissions: Permission[];
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyId: string;
      companyName: string;
      permissions: Permission[];
    }
  }

  interface JWT {
    id?: string;
    role?: string;
    companyId?: string;
    companyName?: string;
    permissions?: Permission[];
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
        // ✅ Usar el tipo ExtendedUser en lugar de any
        const extendedUser = user as ExtendedUser;
        token.id = extendedUser.id;
        token.role = extendedUser.role;
        token.companyId = extendedUser.companyId;
        token.companyName = extendedUser.companyName;
        token.permissions = extendedUser.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
        session.user.permissions = token.permissions as Permission[];
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  debug: true,
};