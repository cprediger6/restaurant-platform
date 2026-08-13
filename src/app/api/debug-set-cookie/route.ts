// src/app/api/auth/debug-set-cookie/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({
    message: "Cookie de prueba",
  });

  // Forzar el seteo de una cookie de prueba
  response.cookies.set("test-cookie", "test-value", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60,
  });

  return response;
}