// src/components/inventory/InventoryDashboard.tsx

'use client'

import { useState } from 'react'
import { InventoryList } from './InventoryList'
import { InventoryItemMovements } from './InventoryItemMovements'
import { InventoryFilters } from './InventoryFilters'
import { InventoryStats } from './InventoryStats'
import { InventoryForm } from './InventoryForm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Plus, RefreshCw, Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react'

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('items')
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    warehouse: '',
    minStock: '',
    maxStock: '',
    status: 'all'
  })

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId)
    setActiveTab('movements')
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Inventario</h2>
          <p className="text-sm text-gray-500">Gestiona el inventario de productos y sus movimientos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Item
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <InventoryStats />

      {/* Filtros */}
      <InventoryFilters onFilterChange={setFilters} />

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-t-xl">
              <TabsTrigger value="items" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items
              </TabsTrigger>
              <TabsTrigger value="movements" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Movimientos
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="p-6">
              <InventoryList 
                key={refreshKey}
                filters={filters}
                onItemSelect={handleItemSelect}
              />
            </TabsContent>

            <TabsContent value="movements" className="p-6">
              {selectedItemId ? (
                <InventoryItemMovements 
                  key={selectedItemId}
                  itemId={selectedItemId}
                />
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Selecciona un item</h3>
                  <p className="text-sm text-gray-500">
                    Haz clic en un item de la lista para ver sus movimientos
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="p-6">
              <InventoryStats />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal para crear/editar */}
      {showForm && (
        <InventoryForm 
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