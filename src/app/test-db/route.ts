// src/app/api/test-db/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

export async function GET() {
  const results: any = {};

  // 1. Verificar que DATABASE_URL existe
  results.DATABASE_URL_exists = !!process.env.DATABASE_URL;
  results.DATABASE_URL_preview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.substring(0, 50) + "..."
    : "NO DEFINIDA";

  // 2. Si existe, intentar conectar
  if (process.env.DATABASE_URL) {
    try {
      console.log("🔍 [Test DB] Intentando conectar a Neon...");
      
      const adapter = new PrismaNeon({
        connectionString: process.env.DATABASE_URL,
      });
      const prisma = new PrismaClient({ adapter });

      // Probar conexión
      await prisma.$queryRaw`SELECT 1 as test`;
      results.connection = "✅ Éxito";
      
      // Contar usuarios
      const userCount = await prisma.user.count();
      results.userCount = userCount;
      
      // Listar usuarios
      const users = await prisma.user.findMany({
        select: { email: true, role: true, isActive: true },
        take: 10,
      });
      results.users = users;

      await prisma.$disconnect();
    } catch (error) {
      results.connection = "❌ Falló";
      results.error = error instanceof Error ? error.message : String(error);
      results.stack = error instanceof Error ? error.stack : undefined;
      console.error("❌ [Test DB] Error:", error);
    }
  }

  return NextResponse.json(results);
}