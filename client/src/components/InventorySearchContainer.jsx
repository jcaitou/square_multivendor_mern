import { FormRow } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { useAllInventoryContext } from '../pages/Inventory'

const InventorySearchContainer = () => {
  const { searchValues } = useAllInventoryContext()
  const { search } = searchValues

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

  return (
    <Wrapper>
      <Form className='form'>
        <div className='form-center'>
          <FormRow
            type='search'
            name='search'
            defaultValue={search}
            onChange={debounce((form) => {
              submit(form)
            })}
          />
        </div>
      </Form>
    </Wrapper>
  )
}

export default InventorySearchContainer
