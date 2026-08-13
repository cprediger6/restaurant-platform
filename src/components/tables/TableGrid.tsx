// src/components/tables/TableGrid.tsx

'use client'

import { Table, Diner } from '@prisma/client'
import { TableCard } from './TableCard'
import { Button } from '@/components/ui/Button'  // ✅ Usando Button.tsx
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AddDinerModal } from './AddDinerModal'

interface TableGridProps {
  tables: (Table & {
    diners: Diner[]
  })[]
  stats: {
    total: number
    available: number
    occupied: number
    totalDiners: number
  }
  onTableUpdate: () => void
}

export function TableGrid({ tables, stats, onTableUpdate }: TableGridProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [showAddDinerModal, setShowAddDinerModal] = useState(false)

  const handleAddDiner = (tableId: string) => {
    setSelectedTableId(tableId)
    setShowAddDinerModal(true)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Mesas</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm text-green-600">Disponibles</p>
          <p className="text-2xl font-bold text-green-700">{stats.available}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-sm text-yellow-600">Ocupadas</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.occupied}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-sm text-blue-600">Comensales</p>
          <p className="text-2xl font-bold text-blue-700">{stats.totalDiners}</p>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <TableCard 
            key={table.id} 
            table={table}
            onAddDiner={handleAddDiner}
          />
        ))}
      </div>

      {/* Modal para agregar comensal */}
      {showAddDinerModal && selectedTableId && (
        <AddDinerModal
          tableId={selectedTableId}
          onClose={() => {
            setShowAddDinerModal(false)
            setSelectedTableId(null)
          }}
          onSuccess={() => {
            setShowAddDinerModal(false)
            setSelectedTableId(null)
            onTableUpdate()
          }}
        />
      )}
    </div>
  )
}