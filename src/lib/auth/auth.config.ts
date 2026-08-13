// src/lib/auth/auth.config.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

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
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // ✅ NO lanzar errores, retornar null
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.name} ${user.lastName}`.trim(),
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name || "",
          permissions: [],
        };
      }
    })
  ],
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
        session.user.permissions = token.permissions;
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