import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppLayout as SharedAppLayout, Sidebar, TopHeader, useNotifications } from '@aeronexis-dynamics/ui'
import { useAuthStore, logoutAndRedirect } from '@aeronexis-dynamics/auth'
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  History,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/orders', label: 'Ordres de fabrication', icon: ClipboardList },
  { to: '/incident/new', label: 'Signaler un incident', icon: AlertTriangle },
  { to: '/history', label: 'Historique', icon: History },
]

export function AppLayout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user } = useAuthStore();
  const notifications = useNotifications('production');

  const header = (
    <TopHeader 
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Rechercher..."
      siteName={user?.siteName || "ATELIER PRINCIPAL"}
      notifications={notifications as any}
      unreadCount={notifications.length}
      showNotifications={showNotifications}
      onToggleNotifications={() => setShowNotifications(!showNotifications)}
    />
  );

  return (
    <SharedAppLayout
      sidebar={
        <Sidebar 
          navItems={navItems} 
          user={user} 
          onLogout={logoutAndRedirect}
          brandName="Aeronexis" 
        />
      }
      header={header}
    >
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} context={{ searchQuery }} />
      </AnimatePresence>
    </SharedAppLayout>
  )
}
