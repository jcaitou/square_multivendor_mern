import { FormRowSearch, FormRow, FormRowSelect, FormRowCheckbox } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { Fragment } from 'react'
import { ALL_LOCATIONS, INVENTORY_SORT_BY } from '../../../utils/constants'
import { useAllInventoryContext } from '../pages/Inventory'
import { useDashboardContext } from '../pages/DashboardLayout'

const InventorySearchContainer = () => {
  const { searchValues } = useAllInventoryContext()
  const { search, sort, locations } = searchValues
  const { user } = useDashboardContext()
  const submit = useSubmit()

  const debounce = (onChange, preFunction = null) => {
    let timeout
    return (e) => {
      const form = e.currentTarget.form
      if (preFunction) {
        preFunction(e)
      }
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        onChange(form)
      }, 1000)
    }
  }

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
    'a-z': 'Alphabetical (a-z)',
    'z-a': 'Alphabetical (z-a)',
    quantityDesc: 'Quantity in stock, most to least',
    quantityAsc: 'Quantity in stock, least to most',
  }

  return (
    <Wrapper>
      <Form className='form'>
        <div className='form-center'>
          <FormRowSearch
            type='search'
            name='search'
            defaultValue={search}
            onChange={debounce((form) => {
              submit(form)
            })}
          />
          <FormRowSelect
            name='sort'
            defaultValue={sort || 'a-z'}
            listLabels={sortLabels}
            list={[...Object.values(INVENTORY_SORT_BY)]}
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
                      onChange={(e) => locationChangeAll(e)}
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
                          // onChange={debounce((form) => {
                          //   submit(form)
                          // }, locationChange)}
                          onChange={(e) => locationChange(e)}
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
          <Link to='/dashboard/inventory' className='btn form-btn delete-btn'>
            Reset Search Values
          </Link>
        </div>

        {/* <button className='btn btn-block form-btn'>submit</button> */}
      </Form>
    </Wrapper>
  )
}

export default InventorySearchContainer
