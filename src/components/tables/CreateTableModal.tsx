// src/components/tables/CreateTableModal.tsx

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useTables } from '@/hooks/useTables'
import { AlertCircle } from 'lucide-react'

interface CreateTableModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateTableModal({ onClose, onSuccess }: CreateTableModalProps) {
  const [number, setNumber] = useState('')
  const [capacity, setCapacity] = useState('4')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { createTable } = useTables()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validaciones
    if (!number.trim()) {
      setError('El número de mesa es requerido')
      setLoading(false)
      return
    }

    const capacityNum = parseInt(capacity)
    if (isNaN(capacityNum) || capacityNum < 1) {
      setError('La capacidad debe ser un número mayor a 0')
      setLoading(false)
      return
    }

    if (capacityNum > 20) {
      setError('La capacidad máxima es 20 personas')
      setLoading(false)
      return
    }

    try {
      await createTable({
        number: number.trim(),
        capacity: capacityNum,
        location: location.trim() || undefined
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la mesa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            🪑 Agregar nueva mesa
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Ingresa los datos de la nueva mesa para el restaurante
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Número de Mesa */}
          <div className="space-y-2">
            <Label htmlFor="number" className="text-sm font-medium">
              Número de mesa *
            </Label>
            <Input
              id="number"
              type="text"
              placeholder="Ej: 10, 11, A1, B2"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              disabled={loading}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-gray-400">
              Puedes usar números o letras (Ej: 1, 2, A1, Terraza-1)
            </p>
          </div>

          {/* Capacidad */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm font-medium">
              Capacidad (personas) *
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Número máximo de personas que puede sentar la mesa (1-20)
            </p>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Ubicación (opcional)
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Ej: Terraza, Interior, Frente al jardín"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Describe dónde se encuentra la mesa
            </p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creando...
                </>
              ) : (
                'Crear mesa'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}