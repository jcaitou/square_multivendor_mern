import { FormRow, FormRowSelect } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'

const SearchContainer = () => {
  const { data, searchValues } = useAllProductsContext()
  console.log(data, searchValues)
  const { search } = searchValues
  console.log(search)
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
            defaultValue=''
            onChange={debounce((form) => {
              submit(form)
            })}
          />

          <Link
            to='/dashboard/all-products'
            className='btn form-btn delete-btn'
          >
            Reset Search Values
          </Link>
          {/* TEMP!!!! */}
        </div>
      </Form>
    </Wrapper>
  )
}

export default SearchContainer
