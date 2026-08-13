// src/lib/auth/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "./auth.config";
import { prisma } from "@/lib/db/prisma-client";
import bcrypt from "bcryptjs";

// ✅ Logs detallados para depurar
console.log("🔧 [Auth] Inicializando en:", process.env.NODE_ENV);
console.log("🔧 [Auth] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("🔧 [Auth] Database URL existe:", !!process.env.DATABASE_URL);

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
        // ✅ LOG 1: Función authorize llamada
        console.log("🔐 [Auth] authorize() INICIADO");
         console.log("🔐 [Auth] authorize() INICIADO (MODO PRUEBA)");

        // ✅ LOG 2: Credenciales recibidas
        console.log("🔐 [Auth] Email recibido:", credentials?.email);
        console.log("🔐 [Auth] Password recibida:", credentials?.password ? "✅ Sí" : "❌ No");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [Auth] Credenciales faltantes");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // ✅ LOG 3: Intentando conectar a la base de datos
          console.log("🔐 [Auth] Conectando a la base de datos...");

          const user = await prisma.user.findUnique({
            where: { email },
            include: { 
              company: true,
              permissions: true
            },
          });

          // ✅ LOG 4: Resultado de la búsqueda
          console.log("🔐 [Auth] Usuario encontrado:", user ? "✅ Sí" : "❌ No");
          
          if (user) {
            console.log("🔐 [Auth] Email del usuario:", user.email);
            console.log("🔐 [Auth] Role del usuario:", user.role);
            console.log("🔐 [Auth] Tiene password:", user.password ? "✅ Sí" : "❌ No");
            console.log("🔐 [Auth] Está activo:", user.isActive ? "✅ Sí" : "❌ No");
          }

          if (!user || !user.password) {
            console.log(`❌ [Auth] Usuario no encontrado o sin password: ${email}`);
            return null;
          }

          // ✅ LOG 5: Verificando contraseña
          console.log("🔐 [Auth] Verificando contraseña...");
          
          const passwordsMatch = await bcrypt.compare(password, user.password);
          
          console.log("🔐 [Auth] Contraseña válida:", passwordsMatch ? "✅ Sí" : "❌ No");

          if (!passwordsMatch) {
            console.log(`❌ [Auth] Contraseña incorrecta: ${email}`);
            return null;
          }

          // ✅ LOG 6: Login exitoso
          console.log(`✅ [Auth] LOGIN EXITOSO: ${email}`);

          const result = {
            id: user.id,
            email: user.email,
            name: `${user.name} ${user.lastName}`.trim(),
            role: user.role,
            companyId: user.companyId || "",
            companyName: user.company?.name || "",
            permissions: user.permissions || [],
          };

          console.log("✅ [Auth] Retornando usuario:", result.email);
          return result;

        } catch (error) {
          // ✅ LOG 7: Error en la base de datos
          console.error("❌ [Auth] ERROR EN BASE DE DATOS:", error);
          console.error("❌ [Auth] Detalles del error:", error instanceof Error ? error.message : "Error desconocido");
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