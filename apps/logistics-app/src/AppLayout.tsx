import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Search, AlertTriangle, Package, BoxSelect, Truck, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from './api/notifications';
import { AnimatePresence } from 'framer-motion';
import { AppLayout as SharedAppLayout, Sidebar, TopHeader, useNotifications } from '@aeronexis-dynamics/ui';
import { useAuthStore, logoutAndRedirect } from '@aeronexis-dynamics/auth';

const navItems = [
  { to: '/', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { to: '/stocks', label: 'Stocks (WMS)', icon: Package },
  { to: '/reservations', label: 'Réservations', icon: BoxSelect },
  { to: '/shipments', label: 'Expéditions', icon: Truck },
];

export default function AppLayout() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user } = useAuthStore();
  
  const notifications = useNotifications('logistics');

  const unreadCount = notifications.length;

  const header = (
    <TopHeader
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Rechercher OF, article, client..."
      notifications={notifications as any}
      unreadCount={unreadCount}
      showNotifications={showNotifications}
      onToggleNotifications={() => setShowNotifications(!showNotifications)}
      siteName={user?.siteName || "SITE ALPHA"}
    />
  );

  return (
    <SharedAppLayout
      sidebar={
        <Sidebar 
          navItems={navItems}
          user={user}
          onLogout={logoutAndRedirect}
          brandName="AERONEXIS"
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
