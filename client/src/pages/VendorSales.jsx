import { Fragment } from 'react'
import { useLoaderData, useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import Wrapper from '../assets/wrappers/VendorSales'
import PageBtnContainer from '../components/PageBtnContainer'
import { SalesByVendorSearchContainer } from '../components'
import { useContext, createContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDashboardContext } from './DashboardLayout'
import { storeLocationsQuery } from './DashboardLayout'

const salesByVendorQuery = (params, storeLocations) => {
  const { startDate, endDate, sort, locations, vendorStatus, page } = params
  const locationsQueryKey =
    !locations || locations.length == 0 ? storeLocations : locations
  return {
    queryKey: [
      'salesbyvendor',
      page ?? 1,
      startDate ?? '',
      endDate ?? '',
      sort ?? 'qtyDesc',
      locationsQueryKey,
      vendorStatus && vendorStatus !== 'all' ? vendorStatus : '',
    ],
    queryFn: async () => {
      const { data } = await customFetch.get(
        '/admorders/sales-by-vendor',
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

    const { locations: storeLocations } = await queryClient.ensureQueryData(
      storeLocationsQuery
    )

    await queryClient.ensureQueryData(
      salesByVendorQuery(params, storeLocations)
    )
    return {
      searchValues: { ...params, locations: locations },
    }
  }

const VendorSalesContext = createContext()

const VendorSales = () => {
  const { users } = useOutletContext()
  const { searchValues } = useLoaderData()
  const { user, storeLocations } = useDashboardContext()
  const { data } = useQuery(salesByVendorQuery(searchValues, storeLocations))

  return (
    <>
      <VendorSalesContext.Provider value={{ searchValues }}>
        <Wrapper>
          <SalesByVendorSearchContainer context={{ searchValues }} />
          {data.length === 0 && <h2>No items to display...</h2>}
          <div className='orders'>
            <div className='items-heading'>
              <span className='order-item-name'>Vendor</span>
              <span>Items Sold</span>
              <span>Total Revenue</span>
            </div>
            {data.map((item) => {
              return (
                <Fragment key={item._id}>
                  <div className='item-details'>
                    <span className='order-item-name'>{item.vendorName} </span>
                    <span>{item.n}</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                </Fragment>
              )
            })}
          </div>
          {/* {data.length > 0 && (
          <PageBtnContainer numOfPages={numOfPages} currentPage={currentPage} />
        )} */}
        </Wrapper>
      </VendorSalesContext.Provider>
    </>
  )
}

export const useVendorSalesContext = () => useContext(VendorSalesContext)

export default VendorSales
