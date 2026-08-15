// src/app/(dashboard)/inventory/page.tsx

import { Metadata } from 'next'
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard'
import { prisma } from '@/lib/db/prisma-client'

export const metadata: Metadata = {
  title: 'Inventario | Sistema de Gestión',
  description: 'Gestiona el inventario de productos'
}

export default async function InventoryPage() {
  try {
    const [totalProducts, totalWarehouses, lowStockItems, totalValue] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.inventoryItem.count({
        where: {
          currentStock: {
            lte: prisma.inventoryItem.fields.reorderPoint
          }
        }
      }),
      prisma.inventoryItem.aggregate({
        _sum: {
          currentStock: true
        }
      })
    ])

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Productos Totales" 
            value={totalProducts}
            icon="📦"
            color="bg-blue-500"
          />
          <StatCard 
            title="Bodegas" 
            value={totalWarehouses}
            icon="🏪"
            color="bg-green-500"
          />
          <StatCard 
            title="Stock Bajo" 
            value={lowStockItems}
            icon="⚠️"
            color="bg-red-500"
          />
          <StatCard 
            title="Valor Total" 
            value={`$${totalValue._sum.currentStock?.toFixed(2) || '0.00'}`}
            icon="💰"
            color="bg-yellow-500"
          />
        </div>

        <InventoryDashboard />
      </div>
    )
  } catch (error) {
    console.error('Error loading inventory page:', error)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error al cargar la página de inventario</p>
          <p className="text-sm text-red-500 mt-2">Por favor, intenta nuevamente más tarde</p>
        </div>
      </div>
    )
  }
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`${color} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}