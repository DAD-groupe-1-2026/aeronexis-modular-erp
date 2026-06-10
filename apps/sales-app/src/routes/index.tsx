import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from '@aeronexis-dynamics/auth';
import { AppLayout } from '../AppLayout';

const DashboardView = lazy(() => import('../pages/DashboardView').then(m => ({ default: m.DashboardView })));
const ClientsView = lazy(() => import('../pages/ClientsView').then(m => ({ default: m.ClientsView })));
const NewClientView = lazy(() => import('../pages/NewClientView').then(m => ({ default: m.NewClientView })));
const ClientDetailView = lazy(() => import('../pages/ClientDetailView').then(m => ({ default: m.ClientDetailView })));
const OrdersView = lazy(() => import('../pages/OrdersView').then(m => ({ default: m.OrdersView })));
const NewOrderView = lazy(() => import('../pages/NewOrderView').then(m => ({ default: m.NewOrderView })));

const LoadingFallback = () => (
  <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
    Chargement du module commercial...
  </div>
);

export const router = createBrowserRouter(
  [
    {
      element: <ProtectedRoute redirectToPortal />,
      children: [
        {
          element: <RoleRoute allowedRoles={['sales', 'admin', 'director']} />,
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
                  path: 'clients',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <ClientsView />
                    </Suspense>
                  ),
                },
                {
                  path: 'clients/new',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <NewClientView />
                    </Suspense>
                  ),
                },
                {
                  path: 'clients/:id',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <ClientDetailView />
                    </Suspense>
                  ),
                },
                {
                  path: 'orders',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <OrdersView />
                    </Suspense>
                  ),
                },
                {
                  path: 'orders/new',
                  element: (
                    <Suspense fallback={<LoadingFallback />}>
                      <NewOrderView />
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
  { basename: '/sales' },
);
