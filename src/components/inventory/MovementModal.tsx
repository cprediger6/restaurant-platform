// src/components/inventory/MovementModal.tsx

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Loader2 } from 'lucide-react'

interface MovementModalProps {
  item: any
  type: 'entry' | 'exit' | 'adjustment'
  onClose: () => void
  onSuccess: () => void
}

export function MovementModal({ item, type, onClose, onSuccess }: MovementModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    quantity: 0,
    unitCost: 0,
    reference: '',
    description: '',
    reason: ''
  })

  const title = {
    entry: 'Registrar Entrada',
    exit: 'Registrar Salida',
    adjustment: 'Registrar Ajuste'
  }[type]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type,
          productId: item.productId,
          variantId: item.variantId || undefined,
          warehouseId: item.warehouseId,
          ...formData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al registrar movimiento')
      }

      const messages = {
        entry: '✅ Entrada registrada correctamente',
        exit: '✅ Salida registrada correctamente',
        adjustment: '✅ Ajuste registrado correctamente'
      }
      alert(messages[type])
      
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
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-gray-500">
            Producto: {item.product?.name}
            {item.variant && ` (${item.variant.name})`}
          </p>
          <p className="text-sm text-gray-500">
            Stock actual: {item.currentStock}
          </p>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({
                ...formData,
                quantity: parseFloat(e.target.value)
              })}
            />
          </div>

          {type === 'entry' && (
            <div>
              <Label htmlFor="unitCost">Costo Unitario *</Label>
              <Input
                id="unitCost"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.unitCost}
                onChange={(e) => setFormData({
                  ...formData,
                  unitCost: parseFloat(e.target.value)
                })}
              />
            </div>
          )}

          <div>
            <Label htmlFor="reference">Referencia</Label>
            <Input
              id="reference"
              placeholder="ej. Compra #123"
              value={formData.reference}
              onChange={(e) => setFormData({
                ...formData,
                reference: e.target.value
              })}
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del movimiento"
              value={formData.description}
              onChange={(e) => setFormData({
                ...formData,
                description: e.target.value
              })}
            />
          </div>

          {type === 'adjustment' && (
            <div>
              <Label htmlFor="reason">Razón del Ajuste *</Label>
              <Textarea
                id="reason"
                required
                placeholder="Ej. Conteo físico, daño, etc."
                value={formData.reason}
                onChange={(e) => setFormData({
                  ...formData,
                  reason: e.target.value
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
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}