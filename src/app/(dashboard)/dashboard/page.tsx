'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Cargando...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="👋 Bienvenido">
          <p className="text-xl font-semibold text-slate-900">
            {session.user?.name}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Rol: {session.user?.role}
          </p>
        </Card>

        <Card title="🏢 Empresa">
          <p className="text-xl font-semibold text-slate-900">
            {session.user?.companyName || 'Restaurante Demo'}
          </p>
        </Card>

        <Card title="✅ Estado">
          <p className="text-xl font-semibold text-slate-900">Activo</p>
          <p className="text-sm text-slate-600 mt-1">Sistema listo para usar</p>
        </Card>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900">🚀 Módulos Disponibles</h3>
        <ul className="mt-3 space-y-2 text-blue-800">
          <li>• 📦 Productos - Catálogo de productos del ERP</li>
          <li>• 📊 Inventario - Control de stock</li>
          <li>• 🪑 Mesas - Gestión de mesas y comensales</li>
          <li>• 👨‍🍳 Recetas - Creación y gestión de recetas</li>
          <li>• 📝 Pedidos - Sistema de pedidos</li>
        </ul>
      </div>
    </div>
  )
}
