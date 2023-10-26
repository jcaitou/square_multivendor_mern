import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddProduct,
  Profile,
  Admin,
  Stats,
  AllProducts,
  EditProduct,
  Inventory,
  AllDiscounts,
  AddDiscount,
  EditDiscount,
} from './pages'
import { checkDefaultTheme } from './utils/checkDefaultTheme'

import { action as registerAction } from './pages/Register'
import { action as loginAction } from './pages/Login'
import { action as deleteProductAction } from './pages/DeleteProduct'
import { loader as dashboardLoader } from './pages/DashboardLayout'
import { loader as allProductsLoader } from './pages/AllProducts'
import { loader as editProductLoader } from './pages/EditProduct'
import { loader as allInventoryLoader } from './pages/Inventory'
import { loader as allDiscountsLoader } from './pages/AllDiscounts'
import { loader as addDiscountLoader } from './pages/AddDiscount'
import { loader as editDiscountLoader } from './pages/EditDiscount'

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
            element: <AddProduct />,
          },
          {
            path: 'all-products',
            element: <AllProducts />,
            loader: allProductsLoader,
          },
          {
            path: 'edit-product/:id',
            element: <EditProduct />,
            loader: editProductLoader,
          },
          {
            path: 'delete-product/:id',
            action: deleteProductAction,
          },
          {
            path: 'inventory',
            element: <Inventory />,
            loader: allInventoryLoader,
          },
          {
            path: 'discounts',
            element: <AllDiscounts />,
            loader: allDiscountsLoader,
          },
          {
            path: 'add-discount',
            element: <AddDiscount />,
            loader: addDiscountLoader,
          },
          {
            path: 'edit-discount/:id',
            element: <EditDiscount />,
            loader: editDiscountLoader,
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
