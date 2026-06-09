import { createBrowserRouter } from 'react-router-dom'
import { RoleRedirector } from '../pages/RoleRedirector'
import Login from '../pages/Login'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <RoleRedirector />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
