'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Package,
  Warehouse,
  Utensils,
  ShoppingCart,
  Users,
  Building2,
  CheckCircle2,
  User,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()

  const stats = [
    { label: 'Productos', value: '124', icon: Package, color: 'blue' },
    { label: 'Mesas', value: '10', icon: Warehouse, color: 'green' },
    { label: 'Recetas', value: '8', icon: Utensils, color: 'purple' },
    { label: 'Pedidos', value: '15', icon: ShoppingCart, color: 'orange' },
  ]

  const modules = [
    { name: 'Productos', description: 'Catálogo de productos del ERP', icon: Package, href: '/dashboard/inventory' },
    { name: 'Inventario', description: 'Control de stock', icon: Warehouse, href: '/dashboard/inventory' },
    { name: 'Mesas', description: 'Gestión de mesas y comensales', icon: Users, href: '/dashboard/tables' },
    { name: 'Recetas', description: 'Creación y gestión de recetas', icon: Utensils, href: '/dashboard/recipes' },
    { name: 'Pedidos', description: 'Sistema de pedidos', icon: ShoppingCart, href: '/dashboard/orders' },
  ]

  const user = session?.user

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bienvenido de vuelta, {user?.name || 'Usuario'}
        </p>
      </div>

      {/* Perfil rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-slate-400">Rol: {user?.role || 'Sin rol'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Restaurante Ejemplo S.A.</p>
                <p className="text-xs text-slate-400">Empresa activa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-slate-200">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Sistema activo</p>
                <p className="text-xs text-slate-400">Listo para usar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600',
          }

          return (
            <Card key={index} className="bg-white shadow-sm border border-slate-200">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Módulos */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Módulos disponibles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {modules.map((mod, index) => {
            const Icon = mod.icon
            return (
              <a
                key={index}
                href={mod.href}
                className="group bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}