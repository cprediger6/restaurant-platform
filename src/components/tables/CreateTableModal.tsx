// src/components/tables/CreateTableModal.tsx

'use client'

import { useState } from 'react'
import { useTables } from '@/hooks/useTables'
import { Table, X, AlertCircle } from 'lucide-react'

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
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la mesa'
      
      // ✅ Mejorar el mensaje para errores comunes
      if (errorMessage.includes('Ya existe una mesa')) {
        setError(`❌ La mesa "${number.trim()}" ya existe. Por favor, usa otro número.`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Table className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Agregar mesa
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Número */}
            <div>
              <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Número de mesa *
              </label>
              <input
                id="tableNumber"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ej: 10, A1, Terraza-1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                disabled={loading}
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-400">
                Usa un número que no esté ocupado
              </p>
            </div>

            {/* Capacidad */}
            <div>
              <label htmlFor="tableCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad (personas) *
              </label>
              <input
                id="tableCapacity"
                type="number"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-400">
                Número máximo de personas (1-20)
              </p>
            </div>

            {/* Ubicación */}
            <div>
              <label htmlFor="tableLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                id="tableLocation"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Terraza, Interior, Frente al jardín"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error mejorado */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creando...
                </>
              ) : (
                'Crear mesa'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}