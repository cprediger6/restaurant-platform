// src/components/inventory/InventoryItemModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Loader2 } from 'lucide-react'

interface InventoryItemModalProps {
  item: any
  onClose: () => void
  onSuccess: () => void
}

export function InventoryItemModal({ item, onClose, onSuccess }: InventoryItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    minStock: item?.minStock || 10,
    maxStock: item?.maxStock || 100,
    reorderPoint: item?.reorderPoint || 20,
    standardCost: item?.standardCost || 0,
    costMethod: item?.costMethod || 'FIFO'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar')
      }

      alert('✅ Item actualizado correctamente')
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
          <DialogTitle>Editar Item de Inventario</DialogTitle>
          <p className="text-sm text-gray-500">
            {item.product?.name} - SKU: {item.product?.sku}
          </p>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  minStock: parseFloat(e.target.value)
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
                  reorderPoint: parseFloat(e.target.value)
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
                  maxStock: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>

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
              <option value="FIFO">FIFO</option>
              <option value="LIFO">LIFO</option>
              <option value="AVERAGE">Promedio</option>
              <option value="STANDARD">Estándar</option>
            </select>
          </div>

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
                  standardCost: parseFloat(e.target.value)
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
              Actualizar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}