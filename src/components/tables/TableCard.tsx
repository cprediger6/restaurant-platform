// src/components/tables/TableCard.tsx

'use client'

import { Table, Diner, TableStatus } from '@prisma/client'
import {
  Users,
  Utensils,
  Plus,
  ChevronRight,
  CircleCheck,
  Clock3,
  LockKeyhole,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface TableCardProps {
  table: Table & { diners: Diner[] }
  onAddDiner: (tableId: string) => void
}

const statusConfig: Record<
  TableStatus,
  {
    label: string
    icon: React.ElementType
    badge: string
    accent: string
    iconBg: string
  }
> = {
  AVAILABLE: {
    label: 'Disponible',
    icon: CircleCheck,
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },

  OCCUPIED: {
    label: 'Ocupada',
    icon: Clock3,
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-600',
  },

  PARTIALLY_CLOSED: {
    label: 'Cierre parcial',
    icon: AlertCircle,
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    accent: 'bg-orange-500',
    iconBg: 'bg-orange-100 text-orange-600',
  },

  CLOSED: {
    label: 'Cerrada',
    icon: LockKeyhole,
    badge: 'bg-red-50 text-red-700 border-red-200',
    accent: 'bg-red-500',
    iconBg: 'bg-red-100 text-red-600',
  },
}

export function TableCard({
  table,
  onAddDiner,
}: TableCardProps) {
  const router = useRouter()

  const activeDiners = table.diners.filter(
    (diner) => diner.active
  )

  const isAvailable =
    table.status === TableStatus.AVAILABLE

  const isOccupied =
    table.status === TableStatus.OCCUPIED ||
    table.status === TableStatus.PARTIALLY_CLOSED

  const status = statusConfig[table.status]
  const StatusIcon = status.icon

  const occupancyPercentage =
    table.capacity > 0
      ? Math.min(
          (activeDiners.length / table.capacity) * 100,
          100
        )
      : 0

  return (
    <Card
      className="
        relative overflow-hidden
        border border-gray-200
        bg-white
        shadow-sm

        touch-manipulation
        select-none

        transition-transform
        active:scale-[0.98]

        rounded-2xl
      "
    >
      {/* Estado */}
      <div
        className={`
          absolute left-0 top-0
          h-1.5 w-full
          ${status.accent}
        `}
      />

      <CardContent className="p-5 sm:p-6">

        {/* HEADER */}
        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div
              className={`
                flex
                h-14 w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                ${status.iconBg}
              `}
            >
              <Utensils className="h-7 w-7" />
            </div>

            <div>

              <div className="text-sm font-medium text-gray-400">
                MESA
              </div>

              <div className="
                text-3xl
                font-bold
                leading-none
                text-gray-900
              ">
                {table.number}
              </div>

            </div>

          </div>

          {/* Estado */}
          <div
            className={`
              flex
              min-h-[40px]
              items-center
              gap-1.5
              rounded-full
              border
              px-3
              text-sm
              font-semibold
              ${status.badge}
            `}
          >
            <StatusIcon className="h-4 w-4" />
            <span>{status.label}</span>
          </div>

        </div>

        {/* OCUPACIÓN */}
        <div className="mt-6">

          <div className="
            flex
            items-center
            justify-between
            text-base
          ">

            <div className="
              flex
              items-center
              gap-2
              text-gray-600
            ">
              <Users className="h-5 w-5 text-gray-400" />

              <span>
                <strong className="text-gray-900">
                  {activeDiners.length}
                </strong>

                {' / '}

                {table.capacity}

                {' personas'}
              </span>
            </div>

            <span className="
              font-semibold
              text-gray-500
            ">
              {Math.round(occupancyPercentage)}%
            </span>

          </div>

          {/* Barra */}
          <div className="
            mt-3
            h-3
            overflow-hidden
            rounded-full
            bg-gray-100
          ">
            <div
              className={`
                h-full
                rounded-full
                ${status.accent}
              `}
              style={{
                width: `${occupancyPercentage}%`,
              }}
            />
          </div>

        </div>

        {/* COMENSALES */}
        <div className="mt-6 min-h-[48px]">

          {activeDiners.length > 0 ? (

            <div className="flex items-center">

              {activeDiners
                .slice(0, 5)
                .map((diner, index) => (

                  <div
                    key={diner.id}
                    className="
                      -ml-2
                      first:ml-0

                      flex
                      h-11 w-11

                      items-center
                      justify-center

                      rounded-full

                      border-[3px]
                      border-white

                      bg-gray-100

                      text-sm
                      font-bold
                      text-gray-600
                    "
                  >
                    {diner.name
                      ? diner.name
                          .charAt(0)
                          .toUpperCase()
                      : index + 1}
                  </div>

                ))}

              {activeDiners.length > 5 && (

                <div className="
                  -ml-2

                  flex
                  h-11 w-11

                  items-center
                  justify-center

                  rounded-full

                  border-[3px]
                  border-white

                  bg-gray-900

                  text-sm
                  font-bold
                  text-white
                ">
                  +{activeDiners.length - 5}
                </div>

              )}

            </div>

          ) : (

            <div className="
              flex
              items-center
              gap-2
              text-base
              text-gray-400
            ">
              <Users className="h-5 w-5" />
              Sin comensales
            </div>

          )}

        </div>

        {/* ACCIONES */}
        <div className="
          mt-6
          border-t
          border-gray-100
          pt-5
        ">

          {/* DISPONIBLE */}
          {isAvailable && (

            <Button
              size="lg"
              className="
                min-h-[52px]
                w-full

                rounded-xl

                bg-gray-900
                text-base
                font-semibold
                text-white

                active:scale-[0.98]

                hover:bg-gray-800
              "
              onClick={() =>
                onAddDiner(table.id)
              }
            >
              <Users className="mr-2 h-5 w-5" />

              Ocupar mesa
            </Button>

          )}

          {/* OCUPADA */}
          {isOccupied && (

            <div className="space-y-3">

              <Button
                variant="outline"
                size="lg"
                className="
                  min-h-[52px]
                  w-full

                  rounded-xl

                  text-base
                  font-semibold

                  active:scale-[0.98]
                "
                onClick={() =>
                  router.push(
                    `/tables/${table.id}`
                  )
                }
              >
                <Utensils className="mr-2 h-5 w-5" />

                Ver pedidos

                <ChevronRight
                  className="
                    ml-auto
                    h-5 w-5
                  "
                />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="
                  min-h-[52px]
                  w-full

                  rounded-xl

                  text-base
                  font-semibold

                  active:scale-[0.98]
                "
                onClick={() =>
                  onAddDiner(table.id)
                }
              >
                <Plus className="mr-2 h-5 w-5" />

                Agregar comensal
              </Button>

            </div>

          )}

          {/* CERRADA */}
          {table.status === TableStatus.CLOSED && (

            <Button
              variant="outline"
              size="lg"
              className="
                min-h-[52px]
                w-full
                rounded-xl
                text-base
              "
              disabled
            >
              <LockKeyhole className="mr-2 h-5 w-5" />

              Mesa cerrada
            </Button>

          )}

        </div>

      </CardContent>
    </Card>
  )
}