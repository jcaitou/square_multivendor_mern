import { UncontrolledFormRow, Logo, FormRowSelect } from '../components'
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
import { useLoaderData } from 'react-router-dom'

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
  // const {data} = useLoaderData()
  // console.log(data)
  const { locations: storeLocations } = useQuery(storeLocationsQuery)?.data

  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const locationIds = storeLocations.map((location) => location._id)
  const locationNames = storeLocations.map((location) => location.name)

  return (
    <>
      <Wrapper>
        <Form method='post' className='form'>
          <Logo />
          <h4>Register</h4>
          <UncontrolledFormRow
            type='text'
            name='name'
            labelText='Vendor Name'
          />
          <UncontrolledFormRow type='email' name='email' />
          <FormRowSelect
            name='location'
            labelText='Location'
            list={locationIds}
            listLabels={locationNames}
            doubleList={true}
          ></FormRowSelect>

          {/* <div className='form-row'>
            <label htmlFor='location' className='form-label'>
              Location
            </label>
            <select name='location' id='location' className='form-select'>
              {storeLocations.map((location) => {
                return (
                  <Fragment key={location._id}>
                    <option value={location._id}>{location.name}</option>
                  </Fragment>
                )
              })}
            </select>
          </div> */}

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
        </Form>
      </Wrapper>
    </>
  )
}
export default Register
