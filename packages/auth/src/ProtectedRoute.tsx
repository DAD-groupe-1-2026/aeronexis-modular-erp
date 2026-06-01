import { Navigate, Outlet } from 'react-router-dom'
import { isAuthBypassed } from './authConfig'
import { useAuthStore } from './useAuthStore'

export function ProtectedRoute() {
  if (isAuthBypassed()) return <Outlet />

  const token = useAuthStore((s) => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
