// src/components/tables/AddOrderItemModal.tsx

'use client'

import { useState, useEffect } from 'react'
import { X, Search, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface AddOrderItemModalProps {
  onClose: () => void
  onAdd: (data: any) => void
  products: any[]
  orderId: string
}

export function AddOrderItemModal({ onClose, onAdd, products, orderId }: AddOrderItemModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAdd = () => {
    if (!selectedProduct) return
    onAdd({
      productId: selectedProduct.id,
      quantity,
      notes,
      unitPrice: selectedProduct.price
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Agregar al pedido</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Buscador y filtros */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 max-h-[300px] overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedProduct?.id === product.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedProduct(product)}
            >
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-500">{product.category}</p>
              <p className="text-sm font-semibold">${product.price}</p>
            </div>
          ))}
        </div>

        {/* Detalles del item */}
        {selectedProduct && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Cantidad</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600">Notas</label>
                <Input
                  type="text"
                  placeholder="Ej: Sin cebolla, bien cocido..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleAdd}>Agregar al pedido</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}