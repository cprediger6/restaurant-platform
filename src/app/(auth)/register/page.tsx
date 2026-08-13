'use client'

import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Registro
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Registro disponible solo para administradores
          </p>
        </div>
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
