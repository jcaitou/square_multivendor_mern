import { FormRow, FormRowSelect, FormRowCheckbox } from '.'
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

  return (
    <Wrapper>
      <Form className='form'>
        <div className='form-center'>
          <FormRow
            type='search'
            name='search'
            defaultValue={search}
            required={false}
            onChange={debounce((form) => {
              submit(form)
            })}
          />
          <FormRowSelect
            name='sort'
            defaultValue={sort || 'a-z'}
            list={[...Object.values(INVENTORY_SORT_BY)]}
            onChange={(e) => {
              submit(e.currentTarget.form)
            }}
          />
          <div className='form-row'>
            <label htmlFor='locations' className='form-label'>
              locations
            </label>
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
            {user.locations.map((itemValue) => {
              return (
                <Fragment key={`select-${itemValue}`}>
                  <input
                    type='checkbox'
                    name='locations'
                    id={`locations-${itemValue}`}
                    value={itemValue}
                    defaultChecked={
                      locations.length === 0 || locations.includes(itemValue)
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
                </Fragment>
              )
            })}
          </div>
        </div>
        <button>submit</button>
      </Form>
    </Wrapper>
  )
}

export default InventorySearchContainer
