import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  History,
  Factory,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAndRedirect, useAuthStore } from '@aeronexis-dynamics/auth'

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/orders', label: 'Ordres de fabrication', icon: ClipboardList },
  { to: '/incident/new', label: 'Signaler un incident', icon: AlertTriangle },
  { to: '/history', label: 'Historique', icon: History },
]

export function Sidebar() {
  const { user } = useAuthStore()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Factory className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Aeronexis</span>
          <span className="text-[10px] text-muted-foreground">Production</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {user?.firstName?.[0] || ''}{user?.lastName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role === 'operator' ? 'Opérateur' : user?.role}</p>
          </div>
          <button onClick={() => logoutAndRedirect()} className="group rounded p-1 hover:bg-destructive/10 transition-colors" title="Se déconnecter">
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  )
}

