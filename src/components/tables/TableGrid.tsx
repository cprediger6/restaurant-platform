// src/components/tables/TableGrid.tsx

'use client'

import { Table, Diner } from '@prisma/client'
import { TableCard } from './TableCard'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AddDinerModal } from './AddDinerModal'
import { CreateTableModal } from './CreateTableModal'

interface TableGridProps {
  tables: (Table & { diners: Diner[] })[]
  stats: {
    total: number
    available: number
    occupied: number
    totalDiners: number
  }
  onRefresh: () => void
}

export function TableGrid({ tables, stats, onRefresh }: TableGridProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [showAddDiner, setShowAddDiner] = useState(false)
  const [showCreateTable, setShowCreateTable] = useState(false)

  const handleAddDiner = (tableId: string) => {
    setSelectedTableId(tableId)
    setShowAddDiner(true)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total</p>
          <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
          <p className="text-xs sm:text-sm text-green-600">Disponibles</p>
          <p className="text-xl sm:text-2xl font-bold text-green-700">{stats.available}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-100">
          <p className="text-xs sm:text-sm text-yellow-600">Ocupadas</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-700">{stats.occupied}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
          <p className="text-xs sm:text-sm text-blue-600">Comensales</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.totalDiners}</p>
        </div>
      </div>

      {/* Botón agregar mesa */}
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowCreateTable(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar mesa
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <TableCard 
            key={table.id} 
            table={table}
            onAddDiner={handleAddDiner}
          />
        ))}
      </div>

      {/* Modales */}
      {showAddDiner && selectedTableId && (
        <AddDinerModal
          tableId={selectedTableId}
          onClose={() => {
            setShowAddDiner(false)
            setSelectedTableId(null)
          }}
          onSuccess={() => {
            setShowAddDiner(false)
            setSelectedTableId(null)
            onRefresh()
          }}
        />
      )}

      {showCreateTable && (
        <CreateTableModal
          onClose={() => setShowCreateTable(false)}
          onSuccess={() => {
            setShowCreateTable(false)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}