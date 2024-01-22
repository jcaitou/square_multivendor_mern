import { FormRow, Logo } from '../components'
import Wrapper from '../assets/wrappers/RegisterAndLoginPage'
import { Fragment } from 'react'
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
import { useQuery } from '@tanstack/react-query'

export const storeLocationsQuery = {
  queryKey: ['storeLocations'],
  queryFn: async () => {
    const { data } = await customFetch.get('/locations/')
    return data
  },
}

export const action = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  // const locations = formData.getAll('locations')
  // data.locations = locations
  // console.log(data)
  try {
    await customFetch.post('/auth/register', data)
    toast.success('Registration successful')
    return null //redirect('/login')
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

export const loader = (queryClient) => async () => {
  try {
    await queryClient.ensureQueryData(storeLocationsQuery)

    return null
  } catch (error) {
    return redirect('/')
  }
}

const Register = () => {
  const { locations: storeLocations } = useQuery(storeLocationsQuery)?.data

  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <>
      <Wrapper>
        <Form method='post' className='form'>
          <Logo />
          <h4>Register</h4>
          <FormRow type='text' name='name' labelText='Vendor Name' />
          <FormRow type='email' name='email' />
          {/* {storeLocations.map((location) => {
            return (
              <Fragment key={location._id}>
                <input
                  type='checkbox'
                  name='locations'
                  id={`locations-${location._id}`}
                  value={location._id}
                />
                <label htmlFor={`locations-${location._id}`}>
                  {location.name}
                </label>
              </Fragment>
            )
          })} */}

          <p className='alert alert-warning' role='alert'>
            The password will be emailed to you. Please make sure that your
            email is correct!
          </p>

          <button
            type='submit'
            className='btn btn-block'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'submitting...' : 'submit'}
          </button>
          <p>
            <small>
              By default your account will be created with two locations. You
              can disable these locations later.
            </small>
          </p>
        </Form>
      </Wrapper>
    </>
  )
}
export default Register
