// src/components/tables/DinerOrder.tsx

'use client'

import { useState, useEffect } from 'react'
import { useOrders } from '@/hooks/useOrders'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Coffee,
  Utensils,
  Cake,
  Search,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react'

interface DinerOrderProps {
  dinerId: string
  tableId: string
  onOrderAdded?: () => void
}

export function DinerOrder({ dinerId, tableId, onOrderAdded }: DinerOrderProps) {
  const { orders, loading, fetchOrders, addOrderItem, updateOrderStatus, removeOrderItem, updateItemNotes } = useOrders()
  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [conflicts, setConflicts] = useState<any[]>([])

  useEffect(() => {
    if (dinerId) {
      fetchOrders(dinerId)
    }
  }, [dinerId])

  const [products, setProducts] = useState<any[]>([])
  
  useEffect(() => {
    // 🔥 Cargar productos reales del ERP
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error cargando productos:', error)
      }
    }
    loadProducts()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category?.name === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 🔥 Manejar alérgenos del comensal
  const [dinerAllergies, setDinerAllergies] = useState<string[]>([])

  useEffect(() => {
  const loadAllergies = async () => {
    try {
      const response = await fetch(`/api/diners/${dinerId}/allergies`)
      const data = await response.json()
      setDinerAllergies(data.map((a: any) => a.allergen.code))
    } catch (error) {
      console.error('Error cargando alérgenos:', error)
    }
  }
  loadAllergies()
}, [dinerId])

  const handleAddItem = async () => {
    if (!selectedProduct) return

    try {
      const result = await addOrderItem({
        orderId: orders[0]?.id,
        productId: selectedProduct.id,
        quantity,
        notes,
        unitPrice: selectedProduct.variants?.[0]?.price || selectedProduct.price || 0
      })

      if (result.conflicts?.length > 0) {
        setConflicts(result.conflicts)
        setTimeout(() => setConflicts([]), 5000)
      }

      setShowAddItem(false)
      setSelectedProduct(null)
      setQuantity(1)
      setNotes('')
      if (onOrderAdded) onOrderAdded()
      fetchOrders(dinerId)
    } catch (error) {
      console.error('Error al agregar item:', error)
    }
  }

  const totalItems = orders.reduce((acc, order) => {
    return acc + order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
  }, 0)

  const totalPrice = orders.reduce((acc, order) => {
    return acc + order.items.reduce((sum: number, item: any) => sum + item.subtotal, 0)
  }, 0)

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Pedidos</h2>
            <p className="text-sm text-gray-500">
              {totalItems} items · ${totalPrice.toFixed(2)}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddItem(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar item
          </Button>
        </div>

        {/* 🔥 Alerta de alérgenos */}
        {dinerAllergies.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Alérgenos del comensal</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dinerAllergies.map((code) => (
                    <Badge key={code} variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      ⚠️ {code}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 Alerta de conflictos */}
        {conflicts.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">⚠️ Alérgenos detectados</p>
                <p className="text-xs text-red-700">
                  Este producto contiene: {conflicts.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de pedidos */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Utensils className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Sin pedidos</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddItem(true)}>
              Agregar primer pedido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                {/* Estado del pedido */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'IN_PREPARATION' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'READY' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status === 'PENDING' ? 'Pendiente' :
                       order.status === 'IN_PREPARATION' ? 'En preparación' :
                       order.status === 'READY' ? 'Listo' : 'Entregado'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'IN_PREPARATION')}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Preparar
                      </button>
                    )}
                    {order.status === 'IN_PREPARATION' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Listo
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="px-3 py-2 flex items-start justify-between hover:bg-gray-50 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{item.product?.name || 'Producto'}</span>
                          <span className="text-xs text-gray-400">x{item.quantity}</span>
                          
                          {/* 🔥 Alérgenos del producto */}
                          {item.allergens?.length > 0 && (
                            <div className="flex gap-1">
                              {item.allergens.map((a: any) => (
                                <Badge key={a.id} variant="outline" className="text-[10px] px-1 py-0 bg-red-50 text-red-600 border-red-200">
                                  ⚠️ {a.code}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">📝 {item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingItemId(item.id)
                            setEditNotes(item.notes || '')
                          }}
                          className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeOrderItem(item.id, order.id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}