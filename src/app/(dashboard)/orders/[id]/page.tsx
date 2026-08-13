'use client'

import { useParams } from 'next/navigation'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Pedido {orderId}</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-slate-600">Detalle del pedido - Próximamente</p>
      </div>
    </div>
  )
}