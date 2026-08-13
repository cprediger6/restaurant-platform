// src/components/tables/TableCard.tsx

'use client'

import { Table, TableStatus, Diner } from '@prisma/client'
import { Users, Utensils, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'  // ✅ Usando Card.tsx
import { Button } from '@/components/ui/Button'           // ✅ Usando Button.tsx
import { useRouter } from 'next/navigation'

interface TableCardProps {
  table: Table & {
    diners: Diner[]
  }
  onAddDiner?: (tableId: string) => void
}

const statusColors = {
  AVAILABLE: 'bg-green-100 border-green-500 text-green-700',
  OCCUPIED: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  PARTIALLY_CLOSED: 'bg-orange-100 border-orange-500 text-orange-700',
  CLOSED: 'bg-red-100 border-red-500 text-red-700'
}

const statusLabels = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  PARTIALLY_CLOSED: 'Cerrada Parcial',
  CLOSED: 'Cerrada'
}

export function TableCard({ table, onAddDiner }: TableCardProps) {
  const router = useRouter()
  const activeDiners = table.diners.filter(d => d.active)
  const isAvailable = table.status === TableStatus.AVAILABLE
  const isOccupied = table.status === TableStatus.OCCUPIED || table.status === TableStatus.PARTIALLY_CLOSED

  const handleClick = () => {
    router.push(`/dashboard/tables/${table.id}`)
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${statusColors[table.status]}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">Mesa {table.number}</h3>
            <p className="text-sm text-gray-500">Capacidad: {table.capacity} personas</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[table.status]}`}>
            {statusLabels[table.status]}
          </span>
        </div>

        {/* Comensales */}
        <div className="mt-3 space-y-2">
          {activeDiners.length > 0 ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{activeDiners.length} comensales</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeDiners.map((diner, index) => (
                  <span 
                    key={diner.id}
                    className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                  >
                    <User className="h-3 w-3" />
                    {diner.name || `Comensal ${index + 1}`}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Sin comensales</p>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-4 flex gap-2">
          {isAvailable && (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                onAddDiner?.(table.id)
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Ocupar mesa
            </Button>
          )}
          {isOccupied && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              <Utensils className="h-4 w-4 mr-2" />
              Ver pedidos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}