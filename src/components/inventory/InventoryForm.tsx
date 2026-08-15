// src/components/inventory/InventoryForm.tsx

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Loader2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
}

interface Warehouse {
  id: string
  name: string
}

interface Variant {
  id: string
  name: string
  value: string
  price: number
}

interface InventoryFormProps {
  onClose: () => void
  onSuccess: () => void
  item?: any
}

export function InventoryForm({ onClose, onSuccess, item }: InventoryFormProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [formData, setFormData] = useState({
    productId: item?.productId || '',
    variantId: item?.variantId || '',
    warehouseId: item?.warehouseId || '',
    locationId: item?.locationId || '',
    minStock: item?.minStock || 10,
    maxStock: item?.maxStock || 100,
    reorderPoint: item?.reorderPoint || 20,
    costMethod: item?.costMethod || 'FIFO',
    standardCost: item?.standardCost || 0
  })

  useEffect(() => {
    // Cargar productos
    fetch('/api/products?limit=100')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar productos')
        return res.json()
      })
      .then((data) => {
        // La API devuelve { items: [], total: 0, ... }
        const productList = data.items || data || []
        setProducts(Array.isArray(productList) ? productList : [])
      })
      .catch((error) => {
        console.error('Error loading products:', error)
        setProducts([])
      })

    // Cargar bodegas
    fetch('/api/warehouses')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar bodegas')
        return res.json()
      })
      .then((data) => {
        setWarehouses(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.error('Error loading warehouses:', error)
        setWarehouses([])
      })
  }, [])

  useEffect(() => {
    if (formData.productId) {
      fetch(`/api/products/${formData.productId}/variants`)
        .then((res) => {
          if (!res.ok) throw new Error('Error al cargar variantes')
          return res.json()
        })
        .then((data) => {
          setVariants(Array.isArray(data) ? data : [])
        })
        .catch((error) => {
          console.error('Error loading variants:', error)
          setVariants([])
        })
    } else {
      setVariants([])
    }
  }, [formData.productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = item ? `/api/inventory/${item.id}` : '/api/inventory'
      const method = item ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar el item')
      }

      alert(item ? '✅ Item actualizado correctamente' : '✅ Item creado correctamente')
      onSuccess()
    } catch (error: any) {
      setError(error.message)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Item de Inventario' : 'Nuevo Item de Inventario'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Producto */}
          <div>
            <Label htmlFor="productId">Producto *</Label>
            <select
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData({
                ...formData,
                productId: e.target.value,
                variantId: '' // Resetear variante
              })}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="">Seleccionar producto</option>
              {products.length === 0 ? (
                <option value="" disabled>Cargando productos...</option>
              ) : (
                products.map((p: Product) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Variante (opcional) */}
          {variants.length > 0 && (
            <div>
              <Label htmlFor="variantId">Variante</Label>
              <select
                id="variantId"
                value={formData.variantId}
                onChange={(e) => setFormData({
                  ...formData,
                  variantId: e.target.value
                })}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Sin variante</option>
                {variants.map((v: Variant) => (
                  <option key={v.id} value={v.id}>
                    {v.name}: {v.value} (${v.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bodega */}
          <div>
            <Label htmlFor="warehouseId">Bodega *</Label>
            <select
              id="warehouseId"
              value={formData.warehouseId}
              onChange={(e) => setFormData({
                ...formData,
                warehouseId: e.target.value
              })}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              required
            >
              <option value="">Seleccionar bodega</option>
              {warehouses.length === 0 ? (
                <option value="" disabled>Cargando bodegas...</option>
              ) : (
                warehouses.map((w: Warehouse) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Niveles de stock */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({
                  ...formData,
                  minStock: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="reorderPoint">Punto de Reorden</Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                value={formData.reorderPoint}
                onChange={(e) => setFormData({
                  ...formData,
                  reorderPoint: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxStock">Stock Máximo</Label>
              <Input
                id="maxStock"
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData({
                  ...formData,
                  maxStock: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>

          {/* Método de costo */}
          <div>
            <Label htmlFor="costMethod">Método de Costo</Label>
            <select
              id="costMethod"
              value={formData.costMethod}
              onChange={(e) => setFormData({
                ...formData,
                costMethod: e.target.value
              })}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="FIFO">FIFO (Primero en entrar, primero en salir)</option>
              <option value="LIFO">LIFO (Último en entrar, primero en salir)</option>
              <option value="AVERAGE">Promedio Ponderado</option>
              <option value="STANDARD">Costo Estándar</option>
            </select>
          </div>

          {/* Costo estándar (si aplica) */}
          {formData.costMethod === 'STANDARD' && (
            <div>
              <Label htmlFor="standardCost">Costo Estándar</Label>
              <Input
                id="standardCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.standardCost}
                onChange={(e) => setFormData({
                  ...formData,
                  standardCost: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {item ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}