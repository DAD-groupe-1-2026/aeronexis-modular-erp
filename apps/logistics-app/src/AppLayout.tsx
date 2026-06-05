import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Bell, Search, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from './api/notifications';

export default function AppLayout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher OF, article, client..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-md text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all outline-none text-slate-700"
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-medium text-sm text-slate-800 flex justify-between">
                    Alertes et Notifications
                    <span className="text-xs bg-red-100 text-red-700 py-0.5 px-2 rounded-full">{unreadCount}</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">Aucune notification</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 border-b border-slate-100 flex gap-3 ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}>
                          <AlertTriangle className={`w-5 h-5 shrink-0 ${notif.type === 'stock_alert' ? 'text-red-500' : 'text-amber-500'}`} />
                          <div>
                            <p className="text-sm text-slate-800 leading-snug">{notif.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-6 w-px bg-slate-200"></div>
            
            <div className="flex items-center text-sm font-medium text-slate-700">
              <span className="mr-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-mono">SITE ALPHA</span>
            </div>
          </div>
        </header>
        
        {/* Main scrollable content (Outlet remplace le state de vue précédent) */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
             <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>
    </div>
  );
}
