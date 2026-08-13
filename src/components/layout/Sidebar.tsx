'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Users, 
  ShoppingCart,
  Utensils,
  Table,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/inventory', label: 'Inventario', icon: Warehouse },
  { href: '/tables', label: 'Mesas', icon: Table },
  { href: '/recipes', label: 'Recetas', icon: Utensils },
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(true)
      } else {
        setIsMobileOpen(false)
      }
    }
    checkScreen()
    window.addEventListener('resize', checkScreen)
    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  // Cerrar el menú al navegar
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  const userName = session?.user?.name || 'Usuario'
  const userRole = session?.user?.role || ''

  return (
    <>
      {/* ✅ Botón hamburguesa - solo visible en móvil */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* ✅ Overlay para móvil */}
      {isMobileOpen && isMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ✅ Sidebar */}
      <aside
        className={cn(
          "w-64 bg-slate-900 text-white h-full p-4 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out",
          isMobileOpen || !isMobile ? "translate-x-0" : "-translate-x-full",
          isMobile ? "w-72" : "w-64"
        )}
      >
        <div className="mb-8">
          <h1 className="text-xl font-bold">Restaurant</h1>
          <p className="text-sm text-slate-400">Sistema de gestión</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 pt-4 mt-4">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{userRole}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}