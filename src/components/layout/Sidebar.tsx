'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Utensils,
  ShoppingCart,
  LogOut,
  User,
  X,
  Building2
} from 'lucide-react'

interface SidebarProps {
  onClose?: () => void
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventario', icon: Package },
  { href: '/recipes', label: 'Recetas', icon: Utensils },
  { href: '/tables', label: 'Mesas', icon: Warehouse },
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart },
]

export function Sidebar({ onClose }: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleClose = () => {
    if (onClose) onClose()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Restaurante</h1>
            <p className="text-[10px] text-slate-400">Sistema de gestión</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Usuario y Logout */}
      <div className="border-t border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">
              {session?.user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {session?.user?.role || 'Sin rol'}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}