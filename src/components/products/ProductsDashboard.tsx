// src/components/products/ProductsDashboard.tsx

'use client'

import { useState } from 'react'
import { ProductList } from './ProductList'
import { ProductFilters } from './ProductFilters'
import { ProductForm } from './ProductForm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, RefreshCw } from 'lucide-react'

export function ProductsDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    isActive: true,
  })

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Catálogo de Productos</h2>
          <p className="text-sm text-gray-500">Gestiona el catálogo de productos y variantes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <ProductFilters onFilterChange={setFilters} />

      <Card>
        <CardContent className="p-6">
          <ProductList key={refreshKey} filters={filters} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      {showForm && (
        <ProductForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}