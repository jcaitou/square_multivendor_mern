import { FormRowSelect } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { SALES_SORT_BY } from '../../../utils/constants'
import { useVendorSalesContext } from '../pages/VendorSales'
import { useDashboardContext } from '../pages/DashboardLayout'
import { SearchByDate, SearchByLocation } from '.'
import { setReportDefaultPeriod } from '../utils/setReportDefaultPeriod'

const SalesByVendorSearchContainer = () => {
  const { searchValues } = useVendorSalesContext()
  const { startDate, endDate, sort, locations, vendorStatus } = searchValues
  const { user, storeLocations } = useDashboardContext()
  const submit = useSubmit()

  const resetLink = setReportDefaultPeriod(
    '/dashboard/admin/sales-by-vendor',
    user.settings.defaultReportPeriod
  )

  const sortLabels = {
    qtyDesc: 'Quantity sold, most to least',
    qtyAsc: 'Quantity sold, least to most',
    revDesc: 'Revenue, highest to lowest',
    revAsc: 'Revenue, lowest to highest',
    'a-z': 'Alphabetical (a-z)',
    'z-a': 'Alphabetical (z-a)',
  }

  return (
    <Wrapper>
      <Form className='form'>
        <div className='form-center'>
          <SearchByDate defaultStartDate={startDate} defaultEndDate={endDate} />

          <FormRowSelect
            name='sort'
            defaultValue={sort || 'qtyDesc'}
            list={[...Object.values(SALES_SORT_BY)]}
            listLabels={sortLabels}
            onChange={(e) => {
              submit(e.currentTarget.form)
            }}
          />

          {user.locationsHistory.length > 1 && (
            <SearchByLocation
              user={user}
              searchLocations={locations}
              allStoreLocations={storeLocations}
            />
          )}

          {user.role === 'admin' && (
            <>
              <div className='form-row'>
                <label htmlFor='locations' className='form-label'>
                  Vendor Status
                </label>
                <div className='locations-search'>
                  <div className='location-search-group'>
                    <input
                      type='radio'
                      name='vendorStatus'
                      id='all'
                      value='all'
                      defaultChecked={
                        vendorStatus !== 'active' && vendorStatus !== 'inactive'
                      }
                      onChange={(e) => {
                        submit(e.currentTarget.form)
                      }}
                    />
                    <label htmlFor='all'>All</label>
                  </div>
                  <div className='location-search-group'>
                    <input
                      type='radio'
                      name='vendorStatus'
                      value='active'
                      id='active'
                      defaultChecked={vendorStatus === 'active'}
                      onChange={(e) => {
                        submit(e.currentTarget.form)
                      }}
                    />
                    <label htmlFor='active'>Active Vendors Only</label>
                  </div>
                  <div className='location-search-group'>
                    <input
                      type='radio'
                      name='vendorStatus'
                      value='inactive'
                      id='inactive'
                      defaultChecked={vendorStatus === 'inactive'}
                      onChange={(e) => {
                        submit(e.currentTarget.form)
                      }}
                    />
                    <label htmlFor='inactive'>Inactive Vendors Only</label>
                  </div>
                </div>
              </div>
            </>
          )}

          <Link to={resetLink} className='btn form-btn delete-btn'>
            Reset Search Values
          </Link>
        </div>
      </Form>
    </Wrapper>
  )
}

export default SalesByVendorSearchContainer
