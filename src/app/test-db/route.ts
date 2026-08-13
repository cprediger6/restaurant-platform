// src/app/api/test-db/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma-client";

export async function GET() {
  try {
    // Probar conexión
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // Contar usuarios
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { email: true, role: true, isActive: true },
    });
    
    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa a la base de datos",
      userCount,
      users,
    });
  } catch (error) {
    console.error("❌ Error de base de datos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}