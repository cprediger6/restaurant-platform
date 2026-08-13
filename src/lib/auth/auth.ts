// src/lib/auth/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "./auth.config";
import { prisma } from "@/lib/db/prisma-client";
import bcrypt from "bcryptjs";

// ✅ Agregar logging para depurar
console.log("🔧 [Auth] Inicializando...");
console.log("🔧 [Auth] NODE_ENV:", process.env.NODE_ENV);
console.log("🔧 [Auth] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("🔧 [Auth] NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Configurado" : "❌ FALTANTE");

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
        console.log("🔐 [Auth] authorize() llamado");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [Auth] Credenciales faltantes");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          console.log(`🔐 [Auth] Buscando usuario: ${email}`);

          const user = await prisma.user.findUnique({
            where: { email },
            include: { 
              company: true,
              permissions: true
            },
          });

          console.log(`🔐 [Auth] Usuario encontrado: ${!!user}`);

          if (!user || !user.password) {
            console.log(`❌ [Auth] Usuario no encontrado o sin password: ${email}`);
            return null;
          }

          console.log(`🔐 [Auth] Verificando contraseña...`);
          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log(`🔐 [Auth] Contraseña válida: ${passwordsMatch}`);

          if (!passwordsMatch) {
            console.log(`❌ [Auth] Contraseña incorrecta: ${email}`);
            return null;
          }

          console.log(`✅ [Auth] Login exitoso: ${email}`);

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
          console.error("❌ [Auth] Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account, profile, email, credentials }) {
      console.log("🔐 [Auth] signIn callback:", user?.email);
      return true;
    },
  },
});

export { handler as GET, handler as POST };