import NextAuth from "next-auth";
import { authOptions } from "./auth.config";

const nextAuthHandler = NextAuth(authOptions);

export async function GET(
  request: Request,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return nextAuthHandler(request as any, context as any);
}

export async function POST(
  request: Request,
  context: { params: Promise<Record<string, string | string[]>> }
) {
  return nextAuthHandler(request as any, context as any);
}