// src/components/products/ProductFilters.tsx

'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    isActive: true,
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
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
      categoryId: '',
      isActive: true,
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, SKU o código..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {isExpanded && <X className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" onClick={handleClearFilters} className="text-gray-500">
              Limpiar
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={String(filters.isActive)}
                onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}