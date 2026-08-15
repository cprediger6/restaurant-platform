// src/app/(dashboard)/tables/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTables } from '@/hooks/useTables'
import { DinerOrder } from '@/components/tables/DinerOrder'
import { AddDinerModal } from '@/components/tables/AddDinerModal'  // ✅ Agregar esta importación
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  ArrowLeft, 
  Users, 
  User, 
  Plus,
  ShoppingCart,
  Clock,
  CheckCircle,
  Utensils
} from 'lucide-react'
import Link from 'next/link'
import { OrderStatus } from '@prisma/client'

export default function TableDetailPage() {
  const params = useParams()
  const tableId = params.id as string
  const { getTableById, loading, error } = useTables()
  const [table, setTable] = useState<any>(null)
  const [selectedDinerId, setSelectedDinerId] = useState<string | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  useEffect(() => {
    if (tableId) {
      loadTable()
    }
  }, [tableId])

  const loadTable = async () => {
    try {
      const data = await getTableById(tableId)
      setTable(data)
      if (data?.diners?.length > 0) {
        setSelectedDinerId(data.diners[0].id)
      }
    } catch (err) {
      console.error('Error al cargar mesa:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-500">Cargando mesa...</p>
        </div>
      </div>
    )
  }

  if (error || !table) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error: {error || 'Mesa no encontrada'}
      </div>
    )
  }

  const activeDiners = table.diners.filter((d: any) => d.active)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/tables">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Mesa {table.number}</h1>
          <p className="text-sm text-gray-500">
            {activeDiners.length} comensales · Capacidad: {table.capacity}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            table.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
            table.status === 'OCCUPIED' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {table.status === 'AVAILABLE' ? 'Disponible' :
             table.status === 'OCCUPIED' ? 'Ocupada' : 'Cerrada'}
          </span>
        </div>
      </div>

      {/* Grid: Comensales a la izquierda, Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de comensales */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comensales
                </h2>
                <Button 
                  size="sm" 
                  onClick={() => setShowOrderModal(true)}
                  disabled={activeDiners.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {activeDiners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay comensales</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowOrderModal(true)}
                  >
                    Agregar comensal
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDiners.map((diner: any) => (
                    <div
                      key={diner.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDinerId === diner.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={() => setSelectedDinerId(diner.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {diner.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium">{diner.name || 'Comensal'}</p>
                            <p className="text-xs text-gray-500">
                              {diner.orders?.filter((o: any) => o.status !== 'BILLED').length || 0} pedidos activos
                            </p>
                          </div>
                        </div>
                        {diner.orders?.some((o: any) => o.status === 'PENDING') && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        {diner.orders?.some((o: any) => o.status === 'READY') && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalle del comensal seleccionado */}
        <div className="lg:col-span-2">
          {selectedDinerId ? (
            <DinerOrder
              dinerId={selectedDinerId}
              tableId={tableId}
              onOrderAdded={loadTable}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un comensal para ver sus pedidos</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para agregar comensal */}
      {showOrderModal && (
        <AddDinerModal
          tableId={tableId}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => {
            setShowOrderModal(false)
            loadTable()
          }}
        />
      )}
    </div>
  )
}