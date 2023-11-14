import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

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
        action: loginAction(queryClient),
      },
      {
        path: 'dashboard',
        element: <DashboardLayout queryClient={queryClient} />,
        loader: dashboardLoader(queryClient),
        children: [
          {
            index: true,
            element: <Stats />,
            loader: statsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          // { path: 'stats', element: <Stats />, loader: statsLoader },
          {
            path: 'add-product',
            element: <AddProduct queryClient={queryClient} />,
          },
          {
            path: 'all-products',
            element: <AllProducts queryClient={queryClient} />,
            loader: allProductsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'edit-product/:id',
            element: <EditProduct queryClient={queryClient} />,
            loader: editProductLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'delete-product/:id',
            action: deleteProductAction,
          },
          {
            path: 'inventory',
            element: <Inventory queryClient={queryClient} />,
            loader: allInventoryLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'discounts',
            element: <AllDiscounts />,
            loader: allDiscountsLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'add-discount',
            element: <AddDiscount queryClient={queryClient} />,
            loader: addDiscountLoader,
            errorElement: <ErrorElement />,
          },
          {
            path: 'edit-discount/:id',
            element: <EditDiscount queryClient={queryClient} />,
            loader: editDiscountLoader,
            errorElement: <ErrorElement />,
          },
          {
            path: 'all-orders',
            element: <AllOrders />,
            loader: allOrdersLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'item-sales',
            element: <ItemSales />,
            loader: itemSalesLoader(queryClient),
            errorElement: <ErrorElement />,
          },
          {
            path: 'file-actions',
            element: <FileActions />,
            loader: fileActionLoader(queryClient),
            errorElement: <ErrorElement />,
          },

          {
            path: 'settings',
            element: <ChangePassword queryClient={queryClient} />,
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
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
export default App
