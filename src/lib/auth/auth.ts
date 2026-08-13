// src/lib/auth/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "./auth.config";
import { prisma } from "@/lib/db/prisma-client";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  ...authOptions,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [Auth] Credenciales faltantes");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          console.log(`🔐 [Auth] Intentando login: ${email}`);

          // 1. Buscar el usuario
          const user = await prisma.user.findUnique({
            where: { email },
            include: { 
              company: true,
              permissions: true
            },
          });

          if (!user || !user.password) {
            console.log(`❌ [Auth] Usuario no encontrado: ${email}`);
            return null;
          }

          // 2. Validar contraseña
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            console.log(`❌ [Auth] Contraseña incorrecta: ${email}`);
            return null;
          }

          console.log(`✅ [Auth] Login exitoso: ${email}`);

          // 3. Retornar el objeto mapeado
          return {
            id: user.id,
            email: user.email,
            name: `${user.name} ${user.lastName}`.trim(),
            role: user.role,
            companyId: user.companyId || "",
            companyName: user.company?.name || "",
            permissions: user.permissions || [],
          };
        } catch (error) {
          console.error("❌ [Auth] Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
  },
});

export { handler as GET, handler as POST };