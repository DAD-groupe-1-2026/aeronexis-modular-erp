import { Bell, Search, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export interface Notification {
  id: string | number;
  message: string;
  createdAt: string | Date;
  type?: 'alert' | 'info' | 'success';
}

export interface TopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  notifications?: Notification[];
  unreadCount?: number;
  showNotifications?: boolean;
  onToggleNotifications?: () => void;
  siteName?: string;
  className?: string;
}

export function TopHeader({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  notifications = [],
  unreadCount = 0,
  showNotifications = false,
  onToggleNotifications,
  siteName,
  className
}: TopHeaderProps) {
  return (
    <header className={cn("h-16 bg-[#0a0a0c]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-8 shadow-sm", className)}>
      <div className="flex items-center w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder} 
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-500/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none text-white placeholder:text-slate-500"
        />
      </div>
      
      <div className="flex items-center space-x-6 z-50">
        <div className="relative">
          <button 
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10 focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0a0a0c]"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-5 py-3.5 border-b border-white/10 bg-white/5 font-semibold text-sm text-white flex justify-between items-center">
                Alertes et Notifications
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 py-0.5 px-2.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">Aucune notification</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-200 leading-snug">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-1.5">
                          {new Date(notif.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {siteName && (
          <>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center text-sm font-medium text-slate-200">
              <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-lg font-mono tracking-wide">
                {siteName}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
