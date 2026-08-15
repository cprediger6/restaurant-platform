// src/components/inventory/InventoryItem.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye
} from 'lucide-react'
import { InventoryItemModal } from './InventoryItemModal'
import { MovementModal } from './MovementModal'

interface InventoryItemProps {
  item: any
  onSelect?: () => void
  onUpdate?: () => void
}

export function InventoryItem({ item, onSelect, onUpdate }: InventoryItemProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [movementType, setMovementType] = useState<'entry' | 'exit' | 'adjustment'>('entry')

  const getStockStatus = () => {
    const stock = item.currentStock || 0
    const minStock = item.minStock || 0
    const maxStock = item.maxStock || Infinity

    if (stock <= minStock) {
      return { 
        color: 'destructive', 
        label: 'Stock Bajo', 
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    }
    if (stock >= maxStock) {
      return { 
        color: 'warning', 
        label: 'Stock Alto', 
        icon: AlertTriangle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    }
    return { 
      color: 'success', 
      label: 'Stock OK', 
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const status = getStockStatus()
  const StatusIcon = status.icon

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este item de inventario?')) return
    
    try {
      const response = await fetch(`/api/inventory?id=${item.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar')
      }
      
      alert('✅ Item eliminado correctamente')
      onUpdate?.()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all hover:border-blue-300 cursor-pointer" onClick={onSelect}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Encabezado */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.product?.name || 'Sin producto'}
                </h4>
                <p className="text-xs text-gray-500 font-mono">
                  SKU: {item.product?.sku || 'N/A'}
                </p>
              </div>
              <Badge className={status.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            {/* Información de stock */}
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-lg p-3">
              <div>
                <span className="text-gray-500">Actual:</span>
                <span className="font-bold ml-1 text-gray-900">{item.currentStock}</span>
              </div>
              <div>
                <span className="text-gray-500">Disponible:</span>
                <span className="font-bold ml-1 text-gray-900">{item.availableStock}</span>
              </div>
              {item.variant && (
                <div className="col-span-2">
                  <span className="text-gray-500">Variante:</span>
                  <span className="ml-1 text-gray-900">{item.variant.name}</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-gray-500">Bodega:</span>
                <span className="ml-1 text-gray-900">{item.warehouse?.name || 'N/A'}</span>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setMovementType('entry')
                  setShowMovementModal(true)
                }}
              >
                <ArrowUp className="h-3 w-3 mr-1" />
                Entrada
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setMovementType('exit')
                  setShowMovementModal(true)
                }}
              >
                <ArrowDown className="h-3 w-3 mr-1" />
                Salida
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setMovementType('adjustment')
                  setShowMovementModal(true)
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Ajuste
              </Button>
            </div>

            {/* Acciones adicionales */}
            <div className="flex justify-end gap-1 pt-1 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.()
                }}
                title="Ver movimientos"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditModal(true)
                }}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {showEditModal && (
        <InventoryItemModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            onUpdate?.()
          }}
        />
      )}

      {showMovementModal && (
        <MovementModal
          item={item}
          type={movementType}
          onClose={() => setShowMovementModal(false)}
          onSuccess={() => {
            setShowMovementModal(false)
            onUpdate?.()
          }}
        />
      )}
    </>
  )
}