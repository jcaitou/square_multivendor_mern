import { Fragment } from 'react'
import { useLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import Wrapper from '../assets/wrappers/ItemSales'
import PageBtnContainer from '../components/PageBtnContainer'
import { SalesSearchContainer } from '../components'
import { useContext, createContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDashboardContext } from './DashboardLayout'
import { userQuery } from './DashboardLayout'

const allItemSalesQuery = (params, user) => {
  const { startDate, endDate, sort, locations, page } = params
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
    ],
    queryFn: async () => {
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
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })
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
                  <span className='order-item-name'>{item.name}</span>
                  <span>{item.quantity}</span>
                  <span>{CADMoney.format(item.basePrice / 100)}</span>
                  <span>
                    {item.discounts === 0
                      ? '-'
                      : CADMoney.format(item.discounts / 100)}
                  </span>
                  <span>{CADMoney.format(item.price / 100)}</span>
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
