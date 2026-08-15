// src/components/inventory/InventoryStats.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  DollarSign,
  Clock,
  RefreshCw
} from 'lucide-react'

export function InventoryStats() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    movementsLastMonth: 0,
    turnoverRate: 0,
    averageDaysInventory: 0,
    topProducts: [],
    recentMovements: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/inventory/stats')
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Asegurar que todos los valores existen
      setStats({
        totalItems: data.totalItems || 0,
        totalValue: data.totalValue || 0,
        lowStockItems: data.lowStockItems || 0,
        movementsLastMonth: data.movementsLastMonth || 0,
        turnoverRate: data.turnoverRate || 0,
        averageDaysInventory: data.averageDaysInventory || 0,
        topProducts: data.topProducts || [],
        recentMovements: data.recentMovements || []
      })
    } catch (error: any) {
      console.error('Error fetching stats:', error)
      setError(error.message || 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800">Error al cargar estadísticas</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Items en Inventario"
          value={stats.totalItems}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Valor Total"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Stock Bajo"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Movimientos (30 días)"
          value={stats.movementsLastMonth}
          icon={RefreshCw}
          color="bg-purple-500"
        />
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rotación de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats.turnoverRate.toFixed(2)}x</div>
              <div className="ml-2 text-sm text-gray-500">
                veces por año
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <Clock className="inline h-4 w-4 mr-1" />
              {stats.averageDaysInventory} días en inventario
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Productos más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topProducts.length > 0 ? (
                stats.topProducts.slice(0, 5).map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                    <span className="text-sm truncate flex-1">{product.name}</span>
                    <span className="text-sm font-medium ml-2">{product.quantity || 0} unidades</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay datos disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimientos recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentMovements.length > 0 ? (
              stats.recentMovements.slice(0, 10).map((movement: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {movement.type === 'IN' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : movement.type === 'OUT' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {movement.inventoryItem?.product?.name || 'Producto'}
                      {movement.inventoryItem?.variant && ` (${movement.inventoryItem.variant.name})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${
                      movement.type === 'IN' ? 'text-green-600' : 
                      movement.type === 'OUT' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay movimientos recientes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`${color} rounded-full p-3 text-white`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}