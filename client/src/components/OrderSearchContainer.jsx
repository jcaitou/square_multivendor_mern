import { FormRow, FormRowSelect, FormRowCheckbox } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { Fragment } from 'react'
import { ORDERS_SORT_BY } from '../../../utils/constants'
import { useAllOrdersContext } from '../pages/AllOrders'
import { useDashboardContext } from '../pages/DashboardLayout'
import { SearchByDate, SearchByLocation } from '.'
import { setReportDefaultPeriod } from '../utils/setReportDefaultPeriod'

const OrderSearchContainer = () => {
  const { searchValues } = useAllOrdersContext()
  const { user, storeLocations } = useDashboardContext()
  const { startDate, endDate, sort, locations } = searchValues
  const submit = useSubmit()

  const resetLink = setReportDefaultPeriod(
    '/dashboard/all-orders',
    user.settings.defaultReportPeriod
  )

  const debounce = (onChange) => {
    let timeout
    return (e) => {
      const form = e.currentTarget.form
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        onChange(form, e)
      }, 1000)
    }
  }

  const sortLabels = {
    dateDesc: 'Date, most recent first',
    dateAsc: 'Date, oldest first',
    priceDesc: 'Order total, highest to lowest',
    priceAsc: 'Order total, lowest to highest',
  }

  return (
    <Wrapper>
      <Form className='form'>
        <div className='form-center'>
          <SearchByDate defaultStartDate={startDate} defaultEndDate={endDate} />

          <FormRowSelect
            name='sort'
            defaultValue={sort || 'a-z'}
            listLabels={sortLabels}
            list={[...Object.values(ORDERS_SORT_BY)]}
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

          {/* <button className='btn btn-block form-btn'>submit</button> */}

          <Link to={resetLink} className='btn form-btn delete-btn'>
            Reset Search Values
          </Link>
        </div>
      </Form>
    </Wrapper>
  )
}

export default OrderSearchContainer
