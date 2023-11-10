import { FormRow, FormRowSelect, FormRowCheckbox } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { Fragment } from 'react'
import { SALES_SORT_BY } from '../../../utils/constants'
import { useItemSalesContext } from '../pages/ItemSales'
import { useDashboardContext } from '../pages/DashboardLayout'

const SalesSearchContainer = () => {
  const { searchValues } = useItemSalesContext()
  const { startDate, endDate, sort } = searchValues
  const { user } = useDashboardContext()
  const submit = useSubmit()

  const debounce = (onChange) => {
    let timeout
    return (e) => {
      const form = e.currentTarget.form
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        onChange(form)
      }, 2000)
    }
  }

  const locationChangeAll = (e) => {
    const locationInputs = document.querySelectorAll('input[name=locations]')
    locationInputs.forEach((input) => {
      input.checked = e.currentTarget.checked
    })
  }

  const locationChange = (e) => {
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
    debounce((form) => {
      submit(form)
    })
  }

  const sortLabels = {
    qtyDesc: 'Quantity sold, most to least',
    qtyAsc: 'Quantity sold, least to most',
    'a-z': 'Alphabetical (a-z)',
    'z-a': 'Alphabetical (z-a)',
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
                  const selectedDate = e.target.value
                  const dateInput = document.querySelector(
                    'input[name=endDate]'
                  )
                  if (!selectedDate) {
                    dateInput.removeAttribute('min')
                  } else {
                    dateInput.setAttribute('min', selectedDate)
                  }
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
                  const selectedDate = e.target.value
                  const dateInput = document.querySelector(
                    'input[name=startDate]'
                  )
                  if (!selectedDate) {
                    dateInput.removeAttribute('max')
                  } else {
                    dateInput.setAttribute('max', selectedDate)
                  }
                }}
              />
            </div>
          </div>
          {/* <div className='form-row'>
            <label htmlFor={sort} className='form-label'>
              Sort
            </label>
            <select
              name={sort}
              id={sort}
              className='form-select'
              defaultValue={sort || qtyDesc}
            >
              {[...Object.values(SALES_SORT_BY)].map((itemValue) => {
                return (
                  <option key={itemValue} value={itemValue}>
                    {sortLabels[itemValue]}
                  </option>
                )
              })}
            </select>
          </div> */}
          <FormRowSelect
            name='sort'
            defaultValue={sort || 'a-z'}
            list={[...Object.values(SALES_SORT_BY)]}
            listLabels={sortLabels}
          />
        </div>
        <button className='btn btn-block form-btn'>submit</button>
      </Form>
    </Wrapper>
  )
}

export default SalesSearchContainer
