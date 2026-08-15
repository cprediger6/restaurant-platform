// src/hooks/useOrders.ts (actualizado)

'use client'

import { useState, useCallback } from 'react'
import { Order, OrderItem, OrderStatus } from '@prisma/client'

interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: {
      id: string
      name: string
      price: number
      unitOfMeasure: string
      category?: string
    }
    variant?: {
      id: string
      name: string
      price: number
    } | null
  })[]
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ GET - Obtener pedidos del comensal
  const fetchOrders = useCallback(async (dinerId: string) => {
    if (!dinerId) {
      setError('ID de comensal requerido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/diners/${dinerId}/orders`)
      if (!response.ok) {
        throw new Error('Error al cargar pedidos')
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ POST - Crear nuevo pedido
  const createOrder = useCallback(async (dinerId: string) => {
    if (!dinerId) {
      throw new Error('ID de comensal requerido')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/diners/${dinerId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear pedido')
      }

      const newOrder = await response.json()
      setOrders(prev => [...prev, newOrder])
      return newOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ POST - Agregar item al pedido
  const addOrderItem = useCallback(async (data: any) => {
    const { orderId, ...itemData } = data

    if (!orderId) {
      throw new Error('ID de pedido requerido')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar item')
      }

      const result = await response.json()
      
      // Actualizar la lista de pedidos
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: [...order.items, result.item],
            total: order.total + (itemData.unitPrice * itemData.quantity)
          }
        }
        return order
      }))

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ PATCH - Actualizar estado del pedido
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    if (!orderId || !status) {
      throw new Error('ID de pedido y estado requeridos')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar estado')
      }

      const updatedOrder = await response.json()
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ))

      return updatedOrder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ DELETE - Eliminar item del pedido
  const removeOrderItem = useCallback(async (itemId: string, orderId: string) => {
    if (!itemId || !orderId) {
      throw new Error('ID de item y pedido requeridos')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar item')
      }

      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.filter(item => item.id !== itemId)
          const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
          return {
            ...order,
            items: updatedItems,
            total: newTotal
          }
        }
        return order
      }))

      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ PATCH - Actualizar notas del item
  const updateItemNotes = useCallback(async (itemId: string, orderId: string, notes: string) => {
    if (!itemId || !orderId) {
      throw new Error('ID de item y pedido requeridos')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/items/${itemId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar notas')
      }

      const updatedItem = await response.json()
      
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => 
            item.id === itemId ? updatedItem : item
          )
          return {
            ...order,
            items: updatedItems
          }
        }
        return order
      }))

      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar notas')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    addOrderItem,
    updateOrderStatus,
    removeOrderItem,
    updateItemNotes,
  }
}