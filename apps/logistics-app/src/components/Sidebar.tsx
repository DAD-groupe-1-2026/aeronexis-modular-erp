import { cn } from '../lib/utils';
import { Package, BoxSelect, Truck, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logoutAndRedirect, useAuthStore } from '@aeronexis-dynamics/auth';
import { motion } from 'framer-motion';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = [
    { path: '/', label: 'Vue d\'ensemble', icon: LayoutDashboard, end: true },
    { path: '/stocks', label: 'Stocks (WMS)', icon: Package },
    { path: '/reservations', label: 'Réservations', icon: BoxSelect },
    { path: '/shipments', label: 'Expéditions', icon: Truck },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0c]/80 backdrop-blur-2xl border-r border-white/10 flex flex-col items-stretch h-full text-slate-300">
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center mr-3">
          <span className="text-indigo-400 font-bold text-lg font-mono leading-none">A</span>
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-sm">AERONEXIS</h1>
          <p className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Logistics</p>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Menu Principal</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === item.path || location.pathname === `${item.path}/`
            : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors group"
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative flex items-center z-10 w-full">
                <Icon className={cn(
                  "w-5 h-5 mr-3 transition-colors duration-200", 
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-white"
                )} />
                <span className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-white font-semibold" : "text-slate-400 group-hover:text-white"
                )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center px-3 py-3 rounded-xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mr-3 shrink-0">
            <span className="text-xs font-bold text-indigo-300">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">Resp. Logistique</p>
          </div>
          <button
            type="button"
            onClick={() => logoutAndRedirect()}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors ml-1"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
