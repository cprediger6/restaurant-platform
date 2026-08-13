// src/components/layout/Sidebar.tsx

'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Utensils, 
  ShoppingCart,
  LogOut,
  User,
  X
} from 'lucide-react'

interface SidebarProps {
  onClose?: () => void
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/inventory', label: 'Inventario', icon: Package },
  { href: '/dashboard/recipes', label: 'Recetas', icon: Utensils },
  { href: '/dashboard/tables', label: 'Mesas', icon: Warehouse },
  { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingCart },
]

export function Sidebar({ onClose }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-white">Restaurante</h1>
          <p className="text-xs text-gray-400">Sistema de gestión</p>
        </div>
        <button
          onClick={handleLinkClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer con usuario */}
      <div className="border-t border-gray-800 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-800/50">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}