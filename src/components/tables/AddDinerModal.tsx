// src/components/tables/AddDinerModal.tsx

'use client'

import { useState } from 'react'
import { useTables } from '@/hooks/useTables'
import { Users, X } from 'lucide-react'

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
      await addDiner(tableId, name.trim() || undefined)
      
      // ✅ Limpiar el campo después de agregar exitosamente
      setName('')
      
      // ✅ En lugar de cerrar, mantenemos el modal abierto para agregar más
      // onSuccess() // ❌ No cerrar automáticamente
      
      // ✅ Mostrar mensaje de éxito y permitir agregar otro
      setError('') // Limpiar errores
      
      // Opcional: mostrar un toast o mensaje de éxito
      // Podrías agregar un estado "success" para mostrar un mensaje verde
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar comensal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Agregar comensal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* ✅ Mensaje de éxito */}
        {!error && name && loading === false && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✅ Comensal agregado correctamente. Puedes agregar otro.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-500 mb-4">
            Agrega un comensal a la mesa. Puedes agregar varios comensales uno por uno.
          </p>

          <div className="mb-4">
            <label htmlFor="dinerName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del comensal <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              id="dinerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Agregando...
                </>
              ) : (
                'Agregar comensal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}