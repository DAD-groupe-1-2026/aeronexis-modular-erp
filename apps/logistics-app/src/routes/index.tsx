import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { LoginPage, ProtectedRoute, RoleRedirector } from '@aeronexis-dynamics/auth'
import AppLayout from '../AppLayout'

const DashboardView = lazy(() => import('../pages/DashboardView'))
const StocksView = lazy(() => import('../pages/StocksView'))
const ReservationsView = lazy(() => import('../pages/ReservationsView'))
const ShipmentsView = lazy(() => import('../pages/ShipmentsView'))

const LoadingFallback = () => (
  <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
    Chargement de la page...
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RoleRedirector />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/logistics',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <DashboardView />
              </Suspense>
            ),
          },
          {
            path: 'stocks',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <StocksView />
              </Suspense>
            ),
          },
          {
            path: 'reservations',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ReservationsView />
              </Suspense>
            ),
          },
          {
            path: 'shipments',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ShipmentsView />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])
