// src/hooks/useTables.ts

'use client'

import { useState, useCallback } from 'react'
import { Table, Diner, TableStatus } from '@prisma/client'
import { useSession } from 'next-auth/react'

interface TableWithDiners extends Table {
  diners: Diner[]
}

interface TableStats {
  total: number
  available: number
  occupied: number
  totalDiners: number
}

export function useTables() {
  const { data: session } = useSession()
  const companyId = session?.user?.companyId || ''

  const [tables, setTables] = useState<TableWithDiners[]>([])
  const [stats, setStats] = useState<TableStats>({
    total: 0,
    available: 0,
    occupied: 0,
    totalDiners: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTables = useCallback(async () => {
    if (!companyId) {
      setError('No se encontró la compañía del usuario')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tables')
      if (!response.ok) {
        throw new Error('Error al cargar mesas')
      }
      const data = await response.json()
      setTables(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mesas')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  const fetchStats = useCallback(async () => {
    if (!companyId) return

    try {
      const response = await fetch('/api/tables?stats=true')
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
    }
  }, [companyId])

  // src/hooks/useTables.ts

// src/hooks/useTables.ts (mejorado)

const createTable = useCallback(async (data: { number: string; capacity: number; location?: string }) => {
  if (!companyId) {
    throw new Error('No se encontró la compañía del usuario')
  }

  const response = await fetch('/api/tables', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, companyId })
  })

  if (!response.ok) {
    const error = await response.json()
    
    // ✅ Mejorar mensajes de error específicos
    if (error.message?.includes('Ya existe una mesa')) {
      throw new Error(`La mesa "${data.number}" ya existe. Por favor, usa otro número.`)
    }
    
    throw new Error(error.message || 'Error al crear mesa')
  }

  return await response.json()
}, [companyId])

  const addDiner = useCallback(async (tableId: string, name?: string) => {
    const response = await fetch(`/api/tables/${tableId}/diners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al agregar comensal')
    }

    return await response.json()
  }, [])

  const removeDiner = useCallback(async (dinerId: string) => {
    const response = await fetch(`/api/diners/${dinerId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al retirar comensal')
    }

    return await response.json()
  }, [])

  const updateTableStatus = useCallback(async (tableId: string, status: TableStatus) => {
    const response = await fetch(`/api/tables/${tableId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar estado')
    }

    return await response.json()
  }, [])

  const deleteTable = useCallback(async (tableId: string) => {
    const response = await fetch(`/api/tables/${tableId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al eliminar mesa')
    }

    return await response.json()
  }, [])

  return {
    tables,
    stats,
    loading,
    error,
    fetchTables,
    fetchStats,
    createTable,
    addDiner,
    removeDiner,
    updateTableStatus,
    deleteTable
  }
}