import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <Sidebar />
      <main className="p-6">
        {children}
      </main>
    </div>
  )
}
