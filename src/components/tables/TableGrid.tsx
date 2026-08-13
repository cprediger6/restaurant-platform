// src/components/tables/TableGrid.tsx

'use client'

import { TableCard } from './TableCard'

export function TableGrid({ tables, stats, onAddDiner }: any) {
  return (
    <div>
      {/* Stats - Grid responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500">Total Mesas</p>
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

      {/* Grid de mesas - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {tables.map((table: any) => (
          <TableCard 
            key={table.id} 
            table={table}
            onAddDiner={onAddDiner}
          />
        ))}
      </div>
    </div>
  )
}