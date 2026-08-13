// src/app/(dashboard)/tables/page.tsx

'use client'

import { useEffect } from 'react'
import { TableGrid } from '@/components/tables/TableGrid'
import { useTables } from '@/hooks/useTables'

export default function TablesPage() {
  const { tables, stats, loading, error, fetchTables, fetchStats } = useTables()

  useEffect(() => {
    fetchTables()
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-500">Cargando mesas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  const handleRefresh = () => {
    fetchTables()
    fetchStats()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">🪑 Mesas</h1>
          <p className="text-gray-500">Gestiona las mesas del restaurante</p>
        </div>
      </div>

      <TableGrid 
        tables={tables}
        stats={stats}
        onRefresh={handleRefresh}
      />
    </div>
  )
}