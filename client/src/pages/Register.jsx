import { FormRow } from '../components'
import Wrapper from '../assets/wrappers/RegisterAndLoginPage'
import { Fragment } from 'react'
import { ALL_LOCATIONS } from '../../../utils/constants'
import {
  Form,
  redirect,
  useNavigate,
  useNavigation,
  Link,
} from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'
import { useDashboardContext } from './DashboardLayout'

export const action = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  try {
    await customFetch.post('/auth/register', data)
    toast.success('Registration successful')
    return redirect('/dashboard')
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const Register = () => {
  const { user } = useDashboardContext()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <>
      <h4>Register</h4>
      <Form method='post' className='form'>
        <FormRow type='text' name='name' labelText='Vendor Name' />
        <FormRow type='email' name='email' />
        {ALL_LOCATIONS.map((location) => {
          return (
            <Fragment key={location.id}>
              <input
                type='checkbox'
                name='locations'
                id={`locations-${location.id}`}
                value={location.id}
              />
              <label htmlFor={`locations-${location.id}`}>
                {location.name}
              </label>
            </Fragment>
          )
        })}

        <button type='submit' className='btn btn-block' disabled={isSubmitting}>
          {isSubmitting ? 'submitting...' : 'submit'}
        </button>
      </Form>
    </>
  )
}
export default Register
