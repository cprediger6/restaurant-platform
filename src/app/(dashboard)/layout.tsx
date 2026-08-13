// src/app/(dashboard)/layout.tsx

import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {/* ✅ ml-64 asegura que el contenido no esté debajo del sidebar */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}