import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Factory, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

export interface SidebarProps {
  navItems: NavItem[];
  user?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  onLogout?: () => void;
  brandName?: string;
}

export function Sidebar({ 
  navItems, 
  user, 
  onLogout,
  brandName = "Aeronexis" 
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a0a0c]/80 backdrop-blur-2xl border-r border-white/10">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-white/10">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <Factory className="h-4 w-4 text-indigo-400" />
        </motion.div>
        <span className="text-sm font-bold tracking-widest text-white uppercase">{brandName}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto space-y-1.5 p-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-sidebar"
                    className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div 
                  className="relative z-10 flex items-center gap-3"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400")} />
                  {label}
                </motion.div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {user.firstName?.[0] || ''}{user.lastName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-indigo-300/70 capitalize">
                {user.role}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="group rounded-lg p-1.5 hover:bg-white/10 transition-all active:scale-95"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
