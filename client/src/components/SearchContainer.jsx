import { FormRow, FormRowSelect } from '.'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useSubmit, Link } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'

const SearchContainer = () => {
  const { data, searchValues } = useAllProductsContext()
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
            defaultValue=''
            // onChange={debounce((form) => {
            //   submit(form)
            // })}
          />

          {/* <Link
            to='/dashboard/all-products'
            className='btn form-btn delete-btn'
          >
            Reset Search Values
          </Link> */}
          <button className='btn btn-block form-btn'>submit</button>
        </div>
      </Form>
    </Wrapper>
  )
}

export default SearchContainer
