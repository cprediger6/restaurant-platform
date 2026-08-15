// src/components/inventory/InventoryFilters.tsx

'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/Card'

interface InventoryFiltersProps {
  onFilterChange: (filters: any) => void
}

export function InventoryFilters({ onFilterChange }: InventoryFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    warehouse: '',
    minStock: '',
    maxStock: '',
    status: 'all' // 'all' | 'low' | 'ok' | 'high'
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    // Cargar bodegas y categorías
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(data))
      .catch(console.error)

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      search: '',
      category: '',
      warehouse: '',
      minStock: '',
      maxStock: '',
      status: 'all'
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const getStatusOptions = () => [
    { value: 'all', label: 'Todos' },
    { value: 'low', label: 'Stock Bajo' },
    { value: 'ok', label: 'Stock OK' },
    { value: 'high', label: 'Stock Alto' }
  ]

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda principal */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, SKU o código..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {isExpanded ? <X className="h-4 w-4" /> : null}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-gray-500"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <Select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Bodega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bodega
            </label>
            <Select
              value={filters.warehouse}
              onChange={(e) => handleFilterChange('warehouse', e.target.value)}
            >
              <option value="">Todas</option>
              {warehouses.map((wh: any) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Estado de Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Stock
            </label>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Rango de Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rango de Stock
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Mín"
                value={filters.minStock}
                onChange={(e) => handleFilterChange('minStock', e.target.value)}
                className="w-1/2"
              />
              <Input
                type="number"
                placeholder="Máx"
                value={filters.maxStock}
                onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                className="w-1/2"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}