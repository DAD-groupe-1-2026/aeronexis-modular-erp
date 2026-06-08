import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
