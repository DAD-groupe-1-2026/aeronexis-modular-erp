import { Navigate } from 'react-router-dom'
import { useAuthStore } from './useAuthStore'

export function RoleRedirector() {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  switch (user.role) {
    case 'operator':
      return <Navigate to="/dashboard" replace />
    case 'logistics':
      return <Navigate to="/logistics" replace />
    case 'sales':
      return <Navigate to="/sales" replace />
    case 'admin':
    case 'director':
      return <Navigate to="/admin" replace />
    default:
      return <div>Rôle inconnu</div>
  }
}
