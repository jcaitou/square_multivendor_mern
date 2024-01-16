import { FormRowSearch, FormRow, FormRowSelect, FormRowCheckbox } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { Fragment } from 'react'
import { INVENTORY_SORT_BY } from '../../../utils/constants'
import { useAllInventoryContext } from '../pages/Inventory'
import { useDashboardContext } from '../pages/DashboardLayout'
import { SearchByLocation } from '.'

const InventorySearchContainer = () => {
  const { searchValues } = useAllInventoryContext()
  const { search, sort, locations } = searchValues
  const { user, storeLocations } = useDashboardContext()
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
          {user.locationsHistory.length > 1 && (
            <SearchByLocation
              user={user}
              searchLocations={locations}
              allStoreLocations={storeLocations}
            />
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
