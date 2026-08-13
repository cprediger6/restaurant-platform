// src/lib/auth/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "./auth.config";
import { prisma } from "@/lib/db/prisma-client";
import bcrypt from "bcryptjs";

console.log("🔧 [Auth] Inicializando en:", process.env.NODE_ENV);
console.log("🔧 [Auth] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

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
        console.log("🔐 [Auth] authorize() INICIADO");
        
        // ✅ LOG 1: Verificar credenciales
        console.log("🔐 [Auth] Email:", credentials?.email);
        console.log("🔐 [Auth] Password recibida:", credentials?.password ? "✅ Sí" : "❌ No");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ [Auth] Credenciales faltantes");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // ✅ LOG 2: Intentar buscar el usuario
        console.log(`🔐 [Auth] Buscando usuario: ${email}`);

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { company: true, permissions: true },
          });

          // ✅ LOG 3: Resultado de la búsqueda
          console.log(`🔐 [Auth] Usuario encontrado: ${!!user}`);
          if (user) {
            console.log(`🔐 [Auth] Email: ${user.email}`);
            console.log(`🔐 [Auth] Role: ${user.role}`);
            console.log(`🔐 [Auth] Tiene password: ${!!user.password}`);
            console.log(`🔐 [Auth] Activo: ${user.isActive}`);
          }

          if (!user || !user.password) {
            console.log(`❌ [Auth] Usuario no encontrado: ${email}`);
            return null;
          }

          // ✅ LOG 4: Verificar contraseña
          console.log("🔐 [Auth] Comparando contraseñas...");
          const passwordsMatch = await bcrypt.compare(password, user.password);
          console.log(`🔐 [Auth] Contraseña válida: ${passwordsMatch}`);

          if (!passwordsMatch) {
            console.log(`❌ [Auth] Contraseña incorrecta: ${email}`);
            return null;
          }

          // ✅ LOG 5: Login exitoso
          console.log(`✅ [Auth] LOGIN EXITOSO: ${email}`);

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
          // ✅ LOG 6: Error en la base de datos
          console.error("❌ [Auth] ERROR EN BASE DE DATOS:", error);
          console.error("❌ [Auth] Mensaje:", error instanceof Error ? error.message : "Error desconocido");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user }) {
      console.log("🔐 [Auth] signIn callback:", user?.email);
      return true;
    },
  },
});

export { handler as GET, handler as POST };