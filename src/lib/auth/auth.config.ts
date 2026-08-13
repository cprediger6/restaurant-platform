// src/lib/auth/auth.config.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma-client";
import { compare } from "bcryptjs";

// ✅ Definir el tipo Permission
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

// ✅ Definir el tipo UserWithCompany (no usar "User" solo)
interface UserWithCompany {
  id: string;
  email: string;
  name: string;
  lastName: string;
  password: string;
  role: string;
  companyId: string;
  company: {
    id: string;
    name: string;
  } | null;
  permissions?: Permission[];
}

// ✅ Extender correctamente los tipos de NextAuth
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
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        }) as UserWithCompany | null;

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // ✅ Retornar el objeto con el tipo correcto
        return {
          id: user.id,
          email: user.email,
          name: `${user.name} ${user.lastName}`.trim(),
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name || "",
          permissions: user.permissions || [],
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ✅ Usar el tipo correcto
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
        session.user.permissions = token.permissions as Permission[];
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};