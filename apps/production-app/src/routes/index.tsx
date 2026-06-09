import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@aeronexis-dynamics/auth'
import { AppLayout } from '@/AppLayout'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })))
const IncidentPage = lazy(() => import('@/pages/IncidentPage').then((m) => ({ default: m.IncidentPage })))
const IncidentDetailPage = lazy(() => import('@/pages/IncidentDetailPage').then((m) => ({ default: m.IncidentDetailPage })))
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))

const Loading = () => (
  <div className="flex h-full items-center justify-center p-12 text-sm text-muted-foreground">
    Chargement...
  </div>
)

export const router = createBrowserRouter(
  [
    {
      element: <ProtectedRoute redirectToPortal />,
      children: [
        {
          element: <AppLayout />,
          children: [
            {
              index: true,
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
              path: '/incidents/:incidentId',
              element: <Suspense fallback={<Loading />}><IncidentDetailPage /></Suspense>,
            },
            {
              path: '/history',
              element: <Suspense fallback={<Loading />}><HistoryPage /></Suspense>,
            },
          ],
        },
      ],
    },
  ],
  { basename: '/production' },
)
