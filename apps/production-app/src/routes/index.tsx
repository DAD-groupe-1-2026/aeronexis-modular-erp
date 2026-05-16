import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { LoginPage, ProtectedRoute } from '@aeronexis-dynamics/auth'
import { AppLayout } from '@/components/layout/AppLayout'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const IncidentPage = lazy(() => import('@/pages/IncidentPage').then((m) => ({ default: m.IncidentPage })))
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))

const Loading = () => (
  <div className="flex h-full items-center justify-center p-12 text-sm text-muted-foreground">
    Chargement...
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <Suspense fallback={<Loading />}><DashboardPage /></Suspense>,
          },
          {
            path: '/orders',
            element: <Suspense fallback={<Loading />}><OrdersPage /></Suspense>,
          },
          {
            path: '/orders/:orderId',
            element: <Suspense fallback={<Loading />}><OrderDetailPage /></Suspense>,
          },
          {
            path: '/incident/new',
            element: <Suspense fallback={<Loading />}><IncidentPage /></Suspense>,
          },
          {
            path: '/history',
            element: <Suspense fallback={<Loading />}><HistoryPage /></Suspense>,
          },
        ],
      },
    ],
  },
])
