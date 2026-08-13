// src/app/(auth)/login/page.tsx

"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center text-white">
              <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
              <p className="mt-4 text-sm text-slate-400">
                Cargando...
              </p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}