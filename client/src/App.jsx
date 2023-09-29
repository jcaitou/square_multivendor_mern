import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Profile,
  Admin,
  Stats,
  AllProducts,
  EditJob,
} from './pages'
import { checkDefaultTheme } from './utils/checkDefaultTheme'

import { action as registerAction } from './pages/Register'
import { action as loginAction } from './pages/Login'
import { action as addProductAction } from './pages/AddJob'
import { action as editProductAction } from './pages/EditJob'
import { loader as dashboardLoader } from './pages/DashboardLayout'
import { loader as allProductsLoader } from './pages/AllProducts'
import { loader as editProductLoader } from './pages/EditJob'

checkDefaultTheme()

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'register',
        element: <Register />,
        action: registerAction,
      },
      {
        path: 'login',
        element: <Login />,
        action: loginAction,
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        loader: dashboardLoader,
        children: [
          {
            index: true,
            element: <Stats />,
          },
          { path: 'stats', element: <Stats /> },
          {
            path: 'add-product',
            element: <AddJob />,
            action: addProductAction,
          },
          {
            path: 'all-products',
            element: <AllProducts />,
            loader: allProductsLoader,
          },
          {
            path: 'edit-product/:id',
            element: <EditJob />,
            loader: editProductLoader,
            action: editProductAction,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'admin',
            element: <Admin />,
          },
        ],
      },
    ],
  },
])

const App = () => {
  return <RouterProvider router={router} />
}
export default App
