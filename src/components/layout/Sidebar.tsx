// src/components/layout/Sidebar.tsx

'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export function Sidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // ✅ Mostrar loading mientras la sesión se carga
  if (status === 'loading') {
    return (
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </aside>
    )
  }

  // ✅ Si no hay sesión, no mostrar el sidebar
  if (!session) {
    return null
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/inventory', label: 'Inventario', icon: '📦' },
    { href: '/recipes', label: 'Recetas', icon: '👨‍🍳' },
    { href: '/tables', label: 'Mesas', icon: '🪑' },
    { href: '/orders', label: 'Pedidos', icon: '📝' },
  ]

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">Restaurante</h1>
        <p className="text-sm text-gray-400">Sistema de gestión</p>
      </div>

      {/* Menú */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ✅ Footer con usuario y botón de logout */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="p-3 bg-gray-700 rounded-lg mb-3">
          <p className="text-sm font-medium">{session.user?.name}</p>
          <p className="text-xs text-gray-400">{session.user?.role}</p>
        </div>

        {/* ✅ Botón de cerrar sesión */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}