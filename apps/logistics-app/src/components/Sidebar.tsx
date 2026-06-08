import { cn } from '../lib/utils';
import { Package, BoxSelect, Truck, LayoutDashboard, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logoutAndRedirect, useAuthStore } from '@aeronexis-dynamics/auth';

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
    <aside className="w-64 bg-slate-900 flex flex-col items-stretch min-h-screen text-slate-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-3">
          <span className="text-white font-bold text-lg font-mono leading-none">A</span>
        </div>
        <div>
          <h1 className="font-semibold text-white tracking-wide text-sm">AERONEXIS</h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Logistics</p>
        </div>
      </div>
      
      <div className="flex-1 px-3 py-6 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Ménu Principal</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === item.path || location.pathname === `${item.path}/`
            : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-600/10 text-blue-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-blue-400" : "text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
            <span className="text-xs font-semibold text-white">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
            </span>
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-white truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
            </p>
            <p className="text-xs text-slate-500 truncate">Resp. Logistique</p>
          </div>
          <button
            type="button"
            onClick={() => logoutAndRedirect()}
            className="text-slate-500 hover:text-white"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
