'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function CreateRecipePage() {
  const router = useRouter()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Nueva Receta</h1>
        <Button variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-slate-600">Formulario de creación - Próximamente</p>
      </div>
    </div>
  )
}
