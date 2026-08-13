// src/components/tables/TableCard.tsx

'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Utensils, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TableCard({ table, onAddDiner }: any) {
  const router = useRouter()
  const activeDiners = table.diners.filter((d: any) => d.active)
  const isAvailable = table.status === 'AVAILABLE'

  const statusColors: Record<string, string> = {
    AVAILABLE: 'border-green-500 bg-green-50',
    OCCUPIED: 'border-yellow-500 bg-yellow-50',
    PARTIALLY_CLOSED: 'border-orange-500 bg-orange-50',
    CLOSED: 'border-red-500 bg-red-50'
  }

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    PARTIALLY_CLOSED: 'Cerrada Parcial',
    CLOSED: 'Cerrada'
  }

  const handleCardClick = () => {
    router.push(`/dashboard/tables/${table.id}`)
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all border-l-4 ${statusColors[table.status]}`}
    >
      {/* ✅ onClick en un contenedor interno */}
      <div onClick={handleCardClick} className="cursor-pointer">
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-base sm:text-lg">Mesa {table.number}</h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Cap: {table.capacity} personas
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[table.status]}`}>
              {statusLabels[table.status]}
            </span>
          </div>

          <div className="mt-2 space-y-2">
            {activeDiners.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{activeDiners.length} comensales</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeDiners.slice(0, 3).map((diner: any, index: number) => (
                    <span 
                      key={diner.id}
                      className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                    >
                      <User className="h-3 w-3" />
                      <span className="max-w-[60px] truncate">
                        {diner.name || `Comensal ${index + 1}`}
                      </span>
                    </span>
                  ))}
                  {activeDiners.length > 3 && (
                    <span className="text-xs text-gray-400">+{activeDiners.length - 3}</span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs sm:text-sm text-gray-400">Sin comensales</p>
            )}
          </div>
        </CardContent>
      </div>

      {/* Botones fuera del div clickable */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        {isAvailable ? (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation()
              onAddDiner?.(table.id)
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ocupar mesa</span>
            <span className="sm:hidden">Ocupar</span>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/tables/${table.id}`)
            }}
          >
            <Utensils className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ver pedidos</span>
            <span className="sm:hidden">Pedidos</span>
          </Button>
        )}
      </div>
    </Card>
  )
}