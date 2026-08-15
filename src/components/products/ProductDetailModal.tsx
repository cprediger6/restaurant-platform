// src/components/products/ProductDetailModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loader2 } from 'lucide-react'

interface ProductDetailModalProps {
  productId: string
  onClose: () => void
}

export function ProductDetailModal({ productId, onClose }: ProductDetailModalProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!product) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <p className="text-center text-gray-500 py-8">Producto no encontrado</p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            <Badge className="ml-2">{product.isActive ? 'Activo' : 'Inactivo'}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">SKU</p>
              <p className="font-mono">{product.sku}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Código Interno</p>
              <p className="font-mono">{product.internalCode}</p>
            </div>
          </div>

          {product.description && (
            <div>
              <p className="text-sm text-gray-500">Descripción</p>
              <p className="text-sm">{product.description}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {product.brand && (
              <div>
                <p className="text-sm text-gray-500">Marca</p>
                <p className="text-sm">{product.brand}</p>
              </div>
            )}
            {product.model && (
              <div>
                <p className="text-sm text-gray-500">Modelo</p>
                <p className="text-sm">{product.model}</p>
              </div>
            )}
            {product.color && (
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="text-sm">{product.color}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {product.size && (
              <div>
                <p className="text-sm text-gray-500">Talla</p>
                <p className="text-sm">{product.size}</p>
              </div>
            )}
            {product.weight && (
              <div>
                <p className="text-sm text-gray-500">Peso</p>
                <p className="text-sm">{product.weight} kg</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Unidad</p>
              <p className="text-sm">{product.unitOfMeasure}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Categoría</p>
            <p className="text-sm">{product.category?.name || 'Sin categoría'}</p>
            {product.subcategory && (
              <p className="text-sm text-gray-400">{product.subcategory.name}</p>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-medium mb-2">Variantes</p>
              <div className="space-y-2">
                {product.variants.map((variant: any) => (
                  <Card key={variant.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {variant.name}: {variant.value}
                          </p>
                          <p className="text-sm text-gray-500 font-mono">SKU: {variant.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${variant.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Stock: {variant.stock || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}