// src/hooks/useTables.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Table, Diner } from '@prisma/client'
import { useSession } from 'next-auth/react'

export function useTables() {
  const { data: session } = useSession()
  const companyId = session?.user?.companyId || ''

  const [tables, setTables] = useState<(Table & { diners: Diner[] })[]>([])
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    totalDiners: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Usar useCallback para memoizar las funciones
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

  // ✅ Effect con las dependencias correctas
  useEffect(() => {
    if (companyId) {
      fetchTables()
      fetchStats()
    }
  }, [companyId, fetchTables, fetchStats])

  // Resto de funciones...
  const createTable = async (data: { number: string; capacity: number; location?: string }) => {
    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, companyId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al crear mesa')
    }

    return await response.json()
  }

  const addDiner = async (tableId: string, name?: string) => {
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
  }

  return {
    tables,
    stats,
    loading,
    error,
    fetchTables,
    fetchStats,
    createTable,
    addDiner,
  }
}