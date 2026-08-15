// src/components/inventory/InventoryItemMovements.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react'

interface Movement {
  id: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER'
  quantity: number
  unitCost: number
  totalCost: number
  reference: string | null
  description: string | null
  createdAt: string
  user?: {
    name: string
  }
}

interface InventoryItemMovementsProps {
  itemId: string
}

type MovementTypeInfo = {
  label: string
  color: 'success' | 'destructive' | 'warning' | 'info' | 'default'
  icon: React.ComponentType<{ className?: string }>
}

export function InventoryItemMovements({ itemId }: InventoryItemMovementsProps) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchMovements()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, dateRange])

  const fetchMovements = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        inventoryItemId: itemId,
        startDate: dateRange.start,
        endDate: dateRange.end
      })
      const response = await fetch(`/api/inventory/movements?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los movimientos')
      }
      
      const data = await response.json()
      setMovements(data)
    } catch (error: any) {
      console.error('Error fetching movements:', error)
      setError(error.message || 'Error al cargar movimientos')
    } finally {
      setLoading(false)
    }
  }

  const getMovementTypeLabel = (type: Movement['type']): MovementTypeInfo => {
    const types: Record<Movement['type'], MovementTypeInfo> = {
      IN: { label: 'Entrada', color: 'success', icon: TrendingUp },
      OUT: { label: 'Salida', color: 'destructive', icon: TrendingDown },
      ADJUSTMENT: { label: 'Ajuste', color: 'warning', icon: RefreshCw },
      TRANSFER: { label: 'Transferencia', color: 'info', icon: RefreshCw }
    }
    return types[type] || { label: type, color: 'default', icon: RefreshCw }
  }

  const exportMovements = () => {
    if (movements.length === 0) {
      alert('No hay movimientos para exportar')
      return
    }

    try {
      // Definir los headers
      const headers = ['Fecha', 'Tipo', 'Cantidad', 'Costo Unitario', 'Costo Total', 'Referencia', 'Descripción', 'Usuario']
      
      // Crear las filas del CSV
      const rows = movements.map((m) => {
        const typeInfo = getMovementTypeLabel(m.type)
        return [
          new Date(m.createdAt).toLocaleDateString(),
          typeInfo.label,
          m.quantity,
          m.unitCost.toFixed(2),
          m.totalCost.toFixed(2),
          m.reference || '',
          m.description || '',
          m.user?.name || ''
        ]
      })

      // Construir el contenido CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Descargar el archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `movimientos_${itemId}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting movements:', error)
      alert('Error al exportar los movimientos')
    }
  }

  // Calcular resumen
  const summary = {
    totalIn: movements
      .filter((m) => m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0),
    totalOut: movements
      .filter((m) => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0),
    totalAdjustments: movements
      .filter((m) => m.type === 'ADJUSTMENT')
      .reduce((sum, m) => sum + m.quantity, 0),
    totalValue: movements
      .reduce((sum, m) => sum + m.totalCost, 0)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="text-right space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <Button 
          variant="outline" 
          onClick={fetchMovements}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros de fecha */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Calendar className="h-5 w-5 text-gray-400" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Desde:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({
              ...dateRange,
              start: e.target.value
            })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Hasta:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({
              ...dateRange,
              end: e.target.value
            })}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportMovements}
          className="ml-auto"
        >
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
      </div>

      {/* Lista de movimientos */}
      {movements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No hay movimientos</h3>
          <p className="text-sm text-gray-500 mt-2">
            No se encontraron movimientos para este período
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((movement) => {
            const typeInfo = getMovementTypeLabel(movement.type)
            const Icon = typeInfo.icon

            return (
              <Card key={movement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        movement.type === 'IN' ? 'bg-green-100' :
                        movement.type === 'OUT' ? 'bg-red-100' :
                        movement.type === 'TRANSFER' ? 'bg-blue-100' :
                        'bg-yellow-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          movement.type === 'IN' ? 'text-green-600' :
                          movement.type === 'OUT' ? 'text-red-600' :
                          movement.type === 'TRANSFER' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-medium">{typeInfo.label}</span>
                          <Badge variant={typeInfo.color}>
                            {movement.quantity} unidades
                          </Badge>
                          {movement.reference && (
                            <span className="text-xs text-gray-400">
                              Ref: {movement.reference}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.description || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">
                        ${movement.totalCost.toFixed(2)}
                      </div>
                      <div className="text-gray-500">
                        ${movement.unitCost.toFixed(2)} / unidad
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(movement.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resumen de movimientos */}
      {movements.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-600 font-medium">Total Entradas</p>
                <p className="text-2xl font-bold text-green-700">
                  {summary.totalIn}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-sm text-red-600 font-medium">Total Salidas</p>
                <p className="text-2xl font-bold text-red-700">
                  {summary.totalOut}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm text-yellow-600 font-medium">Ajustes</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {summary.totalAdjustments}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-600 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${summary.totalValue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}