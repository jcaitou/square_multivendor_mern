import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  AdminLayout,
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
  FileActions,
  ChangePassword,
  AllOrders,
  ItemSales,
} from './pages'
import { ErrorElement } from './components'
import { checkDefaultTheme } from './utils/checkDefaultTheme'

import { action as registerAction } from './pages/Register'
import { action as loginAction } from './pages/Login'
import { action as deleteProductAction } from './pages/DeleteProduct'
import { action as changePasswordAction } from './pages/ChangePassword'

import { loader as dashboardLoader } from './pages/DashboardLayout'
import { loader as adminLayoutLoader } from './pages/AdminLayout'

import { loader as allProductsLoader } from './pages/AllProducts'
import { loader as editProductLoader } from './pages/EditProduct'
import { loader as allInventoryLoader } from './pages/Inventory'
import { loader as allDiscountsLoader } from './pages/AllDiscounts'
import { loader as addDiscountLoader } from './pages/AddDiscount'
import { loader as editDiscountLoader } from './pages/EditDiscount'
import { loader as fileActionLoader } from './pages/FileActions'
import { loader as allOrdersLoader } from './pages/AllOrders'
import { loader as itemSalesLoader } from './pages/ItemSales'
import { loader as statsLoader } from './pages/Stats'

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
            loader: statsLoader,
          },
          { path: 'stats', element: <Stats />, loader: statsLoader },
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
            path: 'all-orders',
            element: <AllOrders />,
            loader: allOrdersLoader,
            errorElement: <ErrorElement />,
          },
          {
            path: 'item-sales',
            element: <ItemSales />,
            loader: itemSalesLoader,
            errorElement: <ErrorElement />,
          },
          {
            path: 'file-actions',
            element: <FileActions />,
            loader: fileActionLoader,
          },

          {
            path: 'settings',
            element: <ChangePassword />,
            action: changePasswordAction,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          // {
          //   path: 'admin',
          //   element: <Admin />,
          // },
          {
            path: 'admin',
            element: <AdminLayout />,
            loader: adminLayoutLoader,
            children: [
              {
                path: 'register',
                element: <Register />,
                action: registerAction,
              },
            ],
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
