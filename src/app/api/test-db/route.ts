// src/app/api/test-db/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// ✅ Definir tipo para los resultados
interface TestResults {
  DATABASE_URL_exists: boolean;
  DATABASE_URL_preview: string;
  connection?: string;
  userCount?: number;
  users?: Array<{ email: string; role: string; isActive: boolean }>;
  error?: string;
  stack?: string;
}

export async function GET() {
  const results: TestResults = {
    DATABASE_URL_exists: !!process.env.DATABASE_URL,
    DATABASE_URL_preview: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 50) + "..."
      : "NO DEFINIDA",
  };

  if (process.env.DATABASE_URL) {
    try {
      console.log("🔍 [Test DB] Intentando conectar a Neon...");

      const adapter = new PrismaNeon({
        connectionString: process.env.DATABASE_URL,
      });
      const prisma = new PrismaClient({ adapter });

      await prisma.$queryRaw`SELECT 1 as test`;
      results.connection = "✅ Éxito";

      const userCount = await prisma.user.count();
      results.userCount = userCount;

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