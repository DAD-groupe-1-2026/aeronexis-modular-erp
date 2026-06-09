import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, RoleRoute } from '@aeronexis-dynamics/auth'
import AppLayout from '../AppLayout'

const DashboardView = lazy(() => import('../pages/DashboardView'))
const StocksView = lazy(() => import('../pages/StocksView'))
const NewArticleView = lazy(() => import('../pages/NewArticleView'))
const ArticleDetailView = lazy(() => import('../pages/ArticleDetailView'))
const ReservationsView = lazy(() => import('../pages/ReservationsView'))
const NewReservationView = lazy(() => import('../pages/NewReservationView'))
const ReservationDetailView = lazy(() => import('../pages/ReservationDetailView'))
const ShipmentsView = lazy(() => import('../pages/ShipmentsView'))
const NewShipmentView = lazy(() => import('../pages/NewShipmentView'))
const ShipmentDetailView = lazy(() => import('../pages/ShipmentDetailView'))

const LoadingFallback = () => (
  <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
    Chargement de la page...
  </div>
)

export const router = createBrowserRouter(
  [
    {
      element: <ProtectedRoute redirectToPortal />,
      children: [
        {
          element: <RoleRoute allowedRoles={['logistics', 'admin', 'director']} />,
          children: [
            {
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
                  path: 'stocks/new',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <NewArticleView />
                    </Suspense>
                  ),
                },
                {
                  path: 'stocks/:id',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <ArticleDetailView />
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
                  path: 'reservations/new',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <NewReservationView />
                    </Suspense>
                  ),
                },
                {
                  path: 'reservations/:id',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <ReservationDetailView />
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
                {
                  path: 'shipments/new',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <NewShipmentView />
                    </Suspense>
                  ),
                },
                {
                  path: 'shipments/:id',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <ShipmentDetailView />
                    </Suspense>
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  { basename: '/logistics' },
)
