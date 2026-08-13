// src/components/layout/Sidebar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/inventory', label: 'Inventario', icon: '📦' },
  { href: '/dashboard/recipes', label: 'Recetas', icon: '👨‍🍳' },
  { href: '/dashboard/tables', label: 'Mesas', icon: '🪑' },
  { href: '/dashboard/orders', label: 'Pedidos', icon: '📝' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role

  // Filtrar menús según rol
  const filteredMenu = menuItems.filter(item => {
    if (userRole === 'ADMIN') return true
    if (userRole === 'MANAGER') return true
    if (userRole === 'WAITER') {
      return ['/dashboard', '/dashboard/tables', '/dashboard/orders'].includes(item.href)
    }
    if (userRole === 'CHEF') {
      return ['/dashboard', '/dashboard/recipes', '/dashboard/orders'].includes(item.href)
    }
    return false
  })

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white z-50 flex flex-col">
      {/* ✅ z-50 asegura que esté por encima del contenido */}
      
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Restaurante</h1>
        <p className="text-sm text-gray-400">Sistema de gestión</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-700'
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="p-3 bg-gray-700 rounded-lg">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <p className="text-xs text-gray-400">{session?.user?.role}</p>
        </div>
      </div>
    </aside>
  )
}