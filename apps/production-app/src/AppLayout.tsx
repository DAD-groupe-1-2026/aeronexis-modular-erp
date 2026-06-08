import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { AnimatePresence } from 'framer-motion'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[#030304] text-slate-200 overflow-hidden relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: `url('/background.jpeg')` }}
      />
      
      {/* Dark Overlay gradient for readability and blending */}
      <div className="absolute inset-0 z-0 bg-[#030304]/60 backdrop-blur-sm"></div>

      {/* Background Atmospheric Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] z-0 pointer-events-none mix-blend-screen"></div>

      {/* Sidebar (glassmorphism inside) */}
      <div className="z-10 h-full flex flex-col justify-between">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="ml-56 flex-1 overflow-y-auto z-10 p-6 relative">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </div>
  )
}
