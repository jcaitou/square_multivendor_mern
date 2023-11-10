import { useLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { Order } from '../components'
import Wrapper from '../assets/wrappers/OrdersContainer'
import PageBtnContainer from '../components/PageBtnContainer'
import { OrderSearchContainer } from '../components'
import { useContext, createContext } from 'react'
import day from 'dayjs'

export const loader = async ({ request }) => {
  try {
    const p = new URL(request.url).searchParams
    let locations = []
    p.forEach((value, key) => {
      if (key === 'locations') {
        locations.push(value)
      }
    })
    const params = Object.fromEntries([...p.entries()])

    const { data } = await customFetch.get(
      '/orders',
      {
        params: {
          ...params,
          locations: locations,
        },
      },
      {
        paramsSerializer: {
          indexes: null,
        },
      }
    )

    return {
      data,
      searchValues: { ...params, locations: locations },
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllOrdersContext = createContext()

const AllOrders = () => {
  const {
    data: {
      currentPage,
      orders,
      numOfPages,
      totalOrders,
      ordersMoneyTotal,
      monthToDateTotal,
    },
    searchValues,
  } = useLoaderData()
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })
  return (
    <AllOrdersContext.Provider value={{ searchValues }}>
      <Wrapper>
        <OrderSearchContainer />
        <div className='revenue-stats'>
          <div className='revenue-card'>
            <span>Selected Period and Location</span>
            <span className='revenue-money'>
              {CADMoney.format(ordersMoneyTotal / 100)}
            </span>
          </div>
          <div className='revenue-card'>
            <span>
              Current Month ({day().format('MMM YYYY')})<br />
              <span className='revenue-card-caption'>*over all Locations</span>
            </span>
            <span className='revenue-money'>
              {CADMoney.format(monthToDateTotal / 100)}
            </span>
          </div>
        </div>
        {orders.length === 0 && <h2>No items to display...</h2>}
        <div className='orders'>
          <div className='orders-heading'>
            <span className='order-item-name'>Item</span>
            <span>Qty</span>
            <span>Base Price</span>
            <span>Discount Applied</span>
            <span>Total</span>
          </div>
          {orders.map((order) => {
            return <Order key={order._id} order={order} />
          })}
        </div>
        {orders.length > 0 && (
          <PageBtnContainer numOfPages={numOfPages} currentPage={currentPage} />
        )}
      </Wrapper>
    </AllOrdersContext.Provider>
  )
}

export const useAllOrdersContext = () => useContext(AllOrdersContext)

export default AllOrders
