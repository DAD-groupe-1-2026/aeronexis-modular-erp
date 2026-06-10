import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { 
  AppLayout as SharedAppLayout, 
  Sidebar, 
  TopHeader,
  useNotifications
} from '@aeronexis-dynamics/ui';
import { LayoutDashboard, Users, ShoppingCart } from 'lucide-react';
import { useAuthStore, logoutAndRedirect } from '@aeronexis-dynamics/auth';
import { AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user } = useAuthStore();
  
  const notifications = useNotifications('sales');
  const unreadCount = notifications.length;
  
  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Clients', to: '/clients', icon: Users },
    { label: 'Commandes', to: '/orders', icon: ShoppingCart },
  ];

  const header = (
    <TopHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Rechercher..."
      notifications={notifications as any}
      unreadCount={unreadCount}
      showNotifications={showNotifications}
      onToggleNotifications={() => setShowNotifications(!showNotifications)}
      siteName={user?.siteName || "COMMERCIAL"}
    />
  );

  return (
    <SharedAppLayout
      sidebar={
        <Sidebar 
          brandName="AeroNexis Sales" 
          navItems={navItems} 
          user={user}
          onLogout={logoutAndRedirect}
        />
      }
      header={header}
    >
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} context={{ searchQuery }} />
      </AnimatePresence>
    </SharedAppLayout>
  );
}
