// src/components/inventory/InventoryList.tsx

'use client'

import { useState, useEffect } from 'react'
import { InventoryItem } from './InventoryItem'
import { InventoryItemSkeleton } from './InventoryItemSkeleton'
import { Button } from '@/components/ui/Button'
import { Package, AlertCircle } from 'lucide-react'

interface InventoryListProps {
  filters: any
  onItemSelect?: (itemId: string) => void
}

export function InventoryList({ filters, onItemSelect }: InventoryListProps) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    fetchItems()
  }, [filters, page])

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
        )
      })

      const response = await fetch(`/api/inventory?${queryParams}`)
      if (!response.ok) {
        throw new Error('Error al cargar el inventario')
      }
      
      const data = await response.json()
      setItems(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalItems || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <InventoryItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800">Error al cargar</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <Button 
          variant="outline" 
          onClick={fetchItems}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No hay items de inventario</h3>
        <p className="text-sm text-gray-500 mt-2">
          Comienza agregando productos al inventario
        </p>
        <Button 
          className="mt-4 bg-blue-600 hover:bg-blue-700"
          onClick={() => window.location.href = '/inventory/new'}
        >
          Agregar item
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Mostrando {items.length} de {totalItems} items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <InventoryItem 
            key={item.id} 
            item={item}
            onSelect={() => onItemSelect?.(item.id)}
            onUpdate={fetchItems}
          />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}