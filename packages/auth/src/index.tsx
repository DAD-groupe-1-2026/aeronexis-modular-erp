import { User } from '@aeronexis-dynamics/shared-types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'aeronexis-auth' }
  )
);

export const isAuthBypassed = () => import.meta.env.VITE_AUTH_BYPASS === 'true';

import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute({ redirectToPortal }: { redirectToPortal?: boolean }) {
  if (isAuthBypassed()) return <Outlet />;
  const token = useAuthStore((s) => s.token);
  
  if (!token) {
    if (redirectToPortal) {
      const loginUrl = import.meta.env.VITE_PORTAL_URL ? `${import.meta.env.VITE_PORTAL_URL}login` : '/login';
      window.location.href = loginUrl;
      return null;
    }
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  if (isAuthBypassed()) return <Outlet />;
  const user = useAuthStore((s) => s.user);
  
  if (!user || !allowedRoles.includes(user.role)) {
    const rootUrl = import.meta.env.VITE_PORTAL_URL || '/';
    window.location.href = rootUrl;
    return null;
  }
  return <Outlet />;
}

export const logoutAndRedirect = () => {
  useAuthStore.getState().logout();
  const loginUrl = import.meta.env.VITE_PORTAL_URL ? `${import.meta.env.VITE_PORTAL_URL}login` : '/login';
  window.location.href = loginUrl;
};
