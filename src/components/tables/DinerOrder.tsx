// src/components/tables/DinerOrder.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Minus, Trash2, Search, X } from 'lucide-react'
import { orderService } from '@/lib/services/orders.service'

interface DinerOrderProps {
  dinerId: string
  tableId: string
  onOrderUpdate: () => void
}

export function DinerOrder({ dinerId, tableId, onOrderUpdate }: DinerOrderProps) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [cart, setCart] = useState<any[]>([])
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  useEffect(() => {
    fetchProducts()
    fetchCurrentOrder()
  }, [dinerId])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products?limit=100&isActive=true')
      if (!response.ok) throw new Error('Error al cargar productos')
      
      const data = await response.json()
      
      // ✅ CORRECCIÓN: La API devuelve { items: [], total: 0, ... }
      const productList = data.items || data || []
      const productsArray = Array.isArray(productList) ? productList : []
      
      setProducts(productsArray)
      
      // Extraer categorías únicas
      const uniqueCategories = Array.from(
        new Set(productsArray.map((p: any) => p.category?.name).filter(Boolean))
      ) as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentOrder = async () => {
    try {
      // Obtener pedidos activos del comensal
      const response = await fetch(`/api/orders?dinerId=${dinerId}&status=PENDING`)
      if (!response.ok) throw new Error('Error al cargar pedido')
      
      const data = await response.json()
      // Si hay un pedido activo, usarlo
      if (data && data.length > 0) {
        setCurrentOrder(data[0])
        // Cargar items del pedido al carrito
        setCart(data[0].items || [])
      } else {
        // Crear nuevo pedido
        const newOrder = await createNewOrder()
        setCurrentOrder(newOrder)
        setCart([])
      }
    } catch (error) {
      console.error('Error fetching current order:', error)
    }
  }

  const createNewOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dinerId })
      })
      if (!response.ok) throw new Error('Error al crear pedido')
      return await response.json()
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        product: product,
        quantity: 1,
        unitPrice: product.variants?.[0]?.price || product.price || 0,
        notes: ''
      }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const newQuantity = Math.max(0, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0)
    )
  }

  const submitOrder = async () => {
    if (!currentOrder || cart.length === 0) {
      alert('No hay items en el carrito')
      return
    }

    setSubmitting(true)
    try {
      // Agregar cada item al pedido
      for (const item of cart) {
        await fetch('/api/orders/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: currentOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes,
            userId: 'system' // O el usuario actual
          })
        })
      }

      // Actualizar estado del pedido a IN_PREPARATION
      await fetch(`/api/orders/${currentOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PREPARATION' })
      })

      alert('✅ Pedido enviado a cocina')
      setCart([])
      onOrderUpdate()
      
      // Recargar el pedido actual
      await fetchCurrentOrder()
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('❌ Error al enviar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }

  // ✅ Aplicar filtros con array seguro
  const filteredProducts = Array.isArray(products) 
    ? products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category?.name === selectedCategory
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
        return matchesCategory && matchesSearch
      })
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de productos */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Menú</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48"
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Categorías */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  No hay productos disponibles
                </div>
              ) : (
                filteredProducts.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category?.name}</p>
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            ${(product.variants?.[0]?.price || product.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="flex-shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carrito */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pedido</span>
              <Badge>{cart.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay items en el pedido
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product?.name || 'Producto'}</p>
                        <p className="text-sm text-gray-500">
                          ${item.unitPrice.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    onClick={submitOrder}
                    disabled={submitting || cart.length === 0}
                  >
                    {submitting ? 'Enviando...' : 'Enviar Pedido'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}