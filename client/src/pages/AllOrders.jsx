import { useLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { Order } from '../components'
import Wrapper from '../assets/wrappers/OrdersContainer'
import PageBtnContainer from '../components/PageBtnContainer'
import { useDashboardContext } from './DashboardLayout'
import { OrderSearchContainer } from '../components'
import { useContext, createContext, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useQuery } from '@tanstack/react-query'
import day from 'dayjs'
import { userQuery } from './DashboardLayout'

const allOrdersQuery = (searchValues, user) => {
  const { startDate, endDate, sort, locations } = searchValues

  const locationsQueryKey =
    !locations || locations.length == 0 ? user.locations : locations

  return {
    queryKey: [
      'orders',
      startDate ?? '',
      endDate ?? '',
      sort ?? 'dateDesc',
      locationsQueryKey,
    ],
    queryFn: async () => {
      const { data } = await customFetch.get(
        '/orders',
        {
          params: {
            startDate,
            endDate,
            sort,
            locations,
          },
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

    await queryClient.ensureQueryData(allOrdersQuery(params, user))

    return {
      searchValues: { ...params, locations: locations },
    }
  }

const AllOrdersContext = createContext()

const AllOrders = () => {
  const { searchValues } = useLoaderData()
  const { user } = useDashboardContext()
  const {
    data: {
      currentPage,
      orders,
      numOfPages,
      totalOrders,
      ordersMoneyTotal,
      monthToDateTotal,
    },
  } = useQuery(allOrdersQuery(searchValues, user))
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })
  const [exportOrdersModalShow, setExportOrdersModalShow] = useState(false)
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
        <div className='product-actions'>
          <div className='grouped-actions'>
            <button
              className='btn'
              onClick={() => setExportOrdersModalShow(true)}
            >
              Export Orders
            </button>
          </div>
        </div>

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
      <ExportOrdersModal
        show={exportOrdersModalShow}
        onHide={() => {
          setExportOrdersModalShow(false)
        }}
      />
    </AllOrdersContext.Provider>
  )
}

function ExportOrdersModal({ ...props }) {
  const { user, storeLocations } = useDashboardContext()
  const today = day()
  const userStartMonth = day(user.createdAt).month()
  const userStartYear = day(user.createdAt).year()

  const [actionSubmitted, setActionSubmitted] = useState(false)

  const [monthRangeStart, setMonthRangeStart] = useState(
    userStartYear == today.year() ? userStartMonth : 0
  )
  const [monthRangeEnd, setMonthRangeEnd] = useState(today.month())
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const generateYearRange = (start, stop, step) =>
    Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step
    )
  const yearRange = generateYearRange(today.year(), userStartYear, -1)

  const yearChange = (e) => {
    if (e.target.value == today.year()) {
      setMonthRangeEnd(today.month())
    } else {
      setMonthRangeEnd(11)
    }
    if (e.target.value == userStartYear) {
      setMonthRangeStart(userStartMonth)
    } else {
      setMonthRangeStart(0)
    }
  }

  const renderMonthOptions = () => {
    const monthOptions = []
    for (let i = monthRangeStart; i <= monthRangeEnd; i++) {
      monthOptions.push(
        <option value={i} key={i}>
          {months[i]}
        </option>
      )
    }
    return monthOptions
  }

  const handleExportSubmit = async (e) => {
    e.preventDefault()

    const month = document.getElementById('export-month').value
    const year = document.getElementById('export-year').value
    const checkedLocations = document.querySelectorAll(
      '#export-locations input:checked'
    )
    const locations = []

    checkedLocations.forEach((el) => {
      locations.push(el.value)
    })

    try {
      await customFetch.post('/exports/export-orders', {
        month,
        year,
        locations,
      })
      toast.success('Full order export will be sent to your email')
      setActionSubmitted(true)
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Export Products by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {actionSubmitted ? (
          <p>Your export has started</p>
        ) : (
          <>
            <p>Choose the date and location of the orders you want to export</p>
            <select name='month' id='export-month'>
              <option value=''>--All--</option>
              {renderMonthOptions()}
            </select>
            <select
              name='year'
              id='export-year'
              defaultValue={today.year()}
              onChange={(e) => yearChange(e)}
            >
              {yearRange.map((year) => {
                return (
                  <option value={year} key={year}>
                    {year}
                  </option>
                )
              })}
            </select>

            {user.locations.map((itemValue) => {
              return (
                <div
                  className='location-search-group'
                  id='export-locations'
                  key={`export-${itemValue}`}
                >
                  <input
                    type='checkbox'
                    name='locations'
                    id={itemValue}
                    value={itemValue}
                    defaultChecked='true'
                  />
                  <label htmlFor={itemValue}>
                    {
                      storeLocations.find((el) => {
                        return el._id === itemValue
                      }).name
                    }
                  </label>
                </div>
              )
            })}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>
          {actionSubmitted ? 'Close' : 'Cancel'}
        </Button>
        {!actionSubmitted && (
          <Button onClick={handleExportSubmit}>Export CSV</Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export const useAllOrdersContext = () => useContext(AllOrdersContext)

export default AllOrders
