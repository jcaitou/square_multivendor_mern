import { Fragment } from 'react'
import { useLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import Wrapper from '../assets/wrappers/ItemSales'
import PageBtnContainer from '../components/PageBtnContainer'
import { SalesSearchContainer } from '../components'
import { useContext, createContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDashboardContext } from './DashboardLayout'
import { userQuery } from './DashboardLayout'

const allItemSalesQuery = (params, user) => {
  const { startDate, endDate, sort, locations, vendorStatus, page } = params
  const locationsQueryKey =
    !locations || locations.length == 0 ? user.locations : locations
  return {
    queryKey: [
      'itemsales',
      page ?? 1,
      startDate ?? '',
      endDate ?? '',
      sort ?? 'qtyDesc',
      locationsQueryKey,
      vendorStatus && vendorStatus !== 'all' ? vendorStatus : '',
    ],
    queryFn: async () => {
      if (user.role === 'admin') {
        const { data } = await customFetch.get(
          '/admorders/sales',
          {
            params,
          },
          {
            paramsSerializer: {
              indexes: null,
            },
          }
        )
        return data
      } else {
        const { data } = await customFetch.get(
          '/orders/sales',
          {
            params,
          },
          {
            paramsSerializer: {
              indexes: null,
            },
          }
        )
        return data
      }
    },
  }
}

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const p = new URL(request.url).searchParams
    let locations = []
    p.forEach((value, key) => {
      if (key === 'locations') {
        locations.push(value)
      }
    })
    const params = Object.fromEntries([...p.entries()])
    params.locations = locations

    const { user } = await queryClient.ensureQueryData(userQuery)

    await queryClient.ensureQueryData(allItemSalesQuery(params, user))
    return {
      searchValues: { ...params, locations: locations },
    }
  }

const ItemSalesContext = createContext()

const ItemSales = () => {
  const { searchValues } = useLoaderData()
  const { user } = useDashboardContext()
  const {
    data: { currentPage, sales, numOfPages, totalItems },
  } = useQuery(allItemSalesQuery(searchValues, user))

  return (
    <ItemSalesContext.Provider value={{ searchValues }}>
      <Wrapper>
        <SalesSearchContainer />
        {sales.length === 0 && <h2>No items to display...</h2>}
        <div className='orders'>
          <div className='items-heading'>
            <span className='order-item-name'>Item</span>
            <span>Qty Sold</span>
            <span>Base Price</span>
            <span>Total Discount Applied</span>
            <span>Total Revenue</span>
          </div>
          {sales.map((item) => {
            return (
              <Fragment key={item._id}>
                <div className='item-details'>
                  <span className='order-item-name'>
                    {item.name} {user.role === 'admin' && ` (${item.vendor})`}
                  </span>
                  <span>{item.quantity}</span>
                  <span>{formatCurrency(item.basePrice)}</span>
                  <span>
                    {item.discounts === 0
                      ? '-'
                      : formatCurrency(item.discounts)}
                  </span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              </Fragment>
            )
          })}
        </div>
        {sales.length > 0 && (
          <PageBtnContainer numOfPages={numOfPages} currentPage={currentPage} />
        )}
      </Wrapper>
    </ItemSalesContext.Provider>
  )
}

export const useItemSalesContext = () => useContext(ItemSalesContext)

export default ItemSales
