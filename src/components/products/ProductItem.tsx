// src/components/products/ProductItem.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Edit, Trash2, Package, ShoppingBag, Eye } from 'lucide-react'
import { ProductForm } from './ProductForm'
import { ProductDetailModal } from './ProductDetailModal'

interface ProductItemProps {
  product: any
  onUpdate: () => void
}

export function ProductItem({ product, onUpdate }: ProductItemProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar')
      }

      alert('✅ Producto eliminado correctamente')
      onUpdate()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const getStockStatus = () => {
    const totalStock = product.inventory?.reduce((sum: number, inv: any) => sum + inv.currentStock, 0) || 0

    if (totalStock === 0) {
      return { color: 'destructive', label: 'Sin Stock' }
    } else if (totalStock < 10) {
      return { color: 'warning', label: 'Stock Bajo' }
    }
    return { color: 'success', label: 'En Stock' }
  }

  const stockStatus = getStockStatus()

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow hover:border-blue-300 cursor-pointer" onClick={() => setShowDetailModal(true)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                <p className="text-xs text-gray-500 font-mono">SKU: {product.sku}</p>
              </div>
              <Badge
                className={
                  stockStatus.color === 'success'
                    ? 'bg-green-100 text-green-800'
                    : stockStatus.color === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {stockStatus.label}
              </Badge>
            </div>

            {product.category && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{product.category.name}</span>
                {product.subcategory && <span className="text-gray-400">› {product.subcategory.name}</span>}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">Precio:</span>
                <span className="font-medium ml-1">
                  {product.variants?.length > 0
                    ? `Desde $${Math.min(...product.variants.map((v: any) => v.price)).toFixed(2)}`
                    : 'Sin variantes'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Variantes:</span>
                <span className="font-medium ml-1">{product.variants?.length || 0}</span>
              </div>
            </div>

            <div className="flex justify-end gap-1 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDetailModal(true)
                }}
                title="Ver detalles"
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

      {showEditModal && (
        <ProductForm
          product={product}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            onUpdate()
          }}
        />
      )}

      {showDetailModal && (
        <ProductDetailModal
          productId={product.id}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  )
}