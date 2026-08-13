// src/components/tables/AddDinerModal.tsx

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
//import { Input } from '@/components/ui/Input'
import { useTables } from '@/hooks/useTables'

interface AddDinerModalProps {
  tableId: string
  onClose: () => void
  onSuccess: () => void
}

export function AddDinerModal({ tableId, onClose, onSuccess }: AddDinerModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addDiner } = useTables()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await addDiner(tableId, name || undefined)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar comensal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar comensal a Mesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del comensal (opcional)
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Si no ingresas nombre, se asignará automáticamente
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar comensal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}