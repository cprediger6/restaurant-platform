// src/app/(dashboard)/products/page.tsx

import { Metadata } from 'next'
import { ProductsDashboard } from '@/components/products/ProductsDashboard'
import { prisma } from '@/lib/db/prisma-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth.config'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Productos | Sistema de Gestión',
  description: 'Gestiona el catálogo de productos',
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    redirect('/auth/login')
  }

  const [totalProducts, totalCategories] = await Promise.all([
    prisma.product.count({
      where: { companyId: session.user.companyId, isActive: true },
    }),
    prisma.category.count({
      where: { companyId: session.user.companyId },
    }),
  ])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Productos Activos" value={totalProducts} icon="📦" color="bg-blue-500" />
        <StatCard title="Categorías" value={totalCategories} icon="📂" color="bg-green-500" />
        <StatCard title="Variantes" value="0" icon="🔄" color="bg-purple-500" />
      </div>

      <ProductsDashboard />
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`${color} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}