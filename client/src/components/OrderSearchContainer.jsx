import { FormRow, FormRowSelect, FormRowCheckbox } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { Fragment } from 'react'
import { ALL_LOCATIONS, ORDERS_SORT_BY } from '../../../utils/constants'
import { useAllOrdersContext } from '../pages/AllOrders'
import { useDashboardContext } from '../pages/DashboardLayout'

const OrderSearchContainer = () => {
  const { searchValues } = useAllOrdersContext()
  const { startDate, endDate, sort, locations } = searchValues
  const { user } = useDashboardContext()
  const submit = useSubmit()

  const locationChangeAll = (e) => {
    const form = e.currentTarget.form
    const locationInputs = document.querySelectorAll('input[name=locations]')
    locationInputs.forEach((input) => {
      input.checked = e.currentTarget.checked
    })
    if (e.currentTarget.checked) {
      submit(form)
    }
  }

  const locationChange = (e) => {
    const form = e.currentTarget.form
    const locationInputs = document.querySelectorAll('input[name=locations]')
    const allLocationInput = document.querySelector(
      'input[value=locations-all]'
    )
    let prop = true
    for (let i = 0; i < locationInputs.length; i++) {
      if (locationInputs[i].checked === false) {
        prop = false
        break
      }
    }
    allLocationInput.checked = prop

    submit(form)
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
          <div className='date-search'>
            <div className='date-group'>
              <label htmlFor='startDate'>Start date:</label>
              <input
                type='date'
                id='startDate'
                name='startDate'
                defaultValue={startDate}
                onChange={(e) => {
                  const form = e.currentTarget.form
                  const selectedDate = e.target.value
                  const dateInput = document.querySelector(
                    'input[name=endDate]'
                  )
                  if (!selectedDate) {
                    dateInput.removeAttribute('min')
                  } else {
                    dateInput.setAttribute('min', selectedDate)
                  }
                  submit(form)
                }}
              />
            </div>
            <div className='date-group'>
              <label htmlFor='endDate'>End date:</label>
              <input
                type='date'
                id='endDate'
                name='endDate'
                defaultValue={endDate}
                onChange={(e) => {
                  const form = e.currentTarget.form
                  const selectedDate = e.target.value
                  const dateInput = document.querySelector(
                    'input[name=startDate]'
                  )
                  if (!selectedDate) {
                    dateInput.removeAttribute('max')
                  } else {
                    dateInput.setAttribute('max', selectedDate)
                  }
                  submit(form)
                }}
              />
            </div>
          </div>

          <FormRowSelect
            name='sort'
            defaultValue={sort || 'a-z'}
            listLabels={sortLabels}
            list={[...Object.values(ORDERS_SORT_BY)]}
            onChange={(e) => {
              submit(e.currentTarget.form)
            }}
          />

          {user.locations.length > 1 && (
            <>
              <div className='form-row'>
                <label htmlFor='locations' className='form-label'>
                  locations
                </label>
                <div className='locations-search'>
                  <div className='location-search-group'>
                    <input
                      type='checkbox'
                      value='locations-all'
                      defaultChecked={
                        locations.length === 0 ||
                        locations.length === user.locations.length
                      }
                      onChange={(e) => {
                        locationChangeAll(e)
                      }}
                    />
                    <label htmlFor='locations-all'>All</label>
                  </div>
                  {user.locations.map((itemValue) => {
                    return (
                      <div
                        className='location-search-group'
                        key={`select-${itemValue}`}
                      >
                        <input
                          type='checkbox'
                          name='locations'
                          id={`locations-${itemValue}`}
                          value={itemValue}
                          defaultChecked={
                            locations.length === 0 ||
                            locations.includes(itemValue)
                          }
                          onChange={(e) => {
                            locationChange(e)
                          }}
                        />
                        <label htmlFor={`locations-${itemValue}`}>
                          {
                            ALL_LOCATIONS.find((el) => {
                              return el.id === itemValue
                            }).name
                          }
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
          <Link to='/dashboard/all-orders' className='btn form-btn delete-btn'>
            Reset Search Values
          </Link>
        </div>
        {/* <button className='btn btn-block form-btn'>submit</button> */}
      </Form>
    </Wrapper>
  )
}

export default OrderSearchContainer
