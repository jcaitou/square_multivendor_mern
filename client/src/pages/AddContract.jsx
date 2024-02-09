import { Logo, FormRowSelect } from '../components'
import Wrapper from '../assets/wrappers/RegisterAndLoginPage'
import { useState, useEffect } from 'react'
import {
  Form,
  redirect,
  useNavigation,
  useOutletContext,
} from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'
import { useDashboardContext } from './DashboardLayout'
import { CONTRACT_TYPE } from '../../../utils/constants.js'
import day from 'dayjs'

export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    try {
      await customFetch.post('/contracts/adm', data)
      queryClient.invalidateQueries(['contracts'])
      queryClient.invalidateQueries(['payments'])
      toast.success('Contract added')
      return redirect('/dashboard/admin/contracts')
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

const AddContract = () => {
  const { users } = useOutletContext()
  const { storeLocations } = useDashboardContext()

  const vendors = users.filter((el) => el.role === 'user')
  let initalList = []
  if (vendors.length > 0) {
    initalList = storeLocations.filter((el) => {
      return !vendors[0].locations.includes(el._id)
    })
  }

  const [locationList, setLocationList] = useState(initalList)
  const [location, setLocation] = useState(initalList[0])
  const [contractType, setContractType] = useState(CONTRACT_TYPE.STARTER)

  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const checkLocations = (e) => {
    const selectedId = e.target.value
    const selectedVendor = vendors.find((el) => el._id === selectedId)
    const vendorCurrentLocations = selectedVendor.locations

    const inactiveLocations = storeLocations.filter((el) => {
      return !vendorCurrentLocations.includes(el._id)
    })
    setLocationList(inactiveLocations)
  }

  const checkFees = () => {
    const feeInput = document.querySelector('input[id="monthlyRent"]')
    if (!location) {
      feeInput.value = 0
    } else {
      const feeTable = location?.fees
      const fee = feeTable[contractType]
      feeInput.value = fee / 100.0
    }
  }

  useEffect(() => {
    checkFees()
  })

  return (
    <>
      <Wrapper>
        <Form method='post' className='form'>
          <Logo />
          <h4>Add a Contract</h4>

          <div className='form-row'>
            <label htmlFor='vendorId' className='form-label'>
              Vendor Name
            </label>
            <select
              name='vendorId'
              id='vendorId'
              className='form-select'
              onChange={(e) => checkLocations(e)}
            >
              {vendors.map((itemValue, index) => {
                return (
                  <option key={itemValue._id} value={itemValue._id}>
                    {itemValue.name}
                  </option>
                )
              })}
            </select>
          </div>
          <FormRowSelect
            name='contractType'
            labelText='Contract Type'
            list={Object.values(CONTRACT_TYPE)}
            defaultValue={CONTRACT_TYPE.STARTER}
            onChange={(e) => setContractType(e.target.value)}
          ></FormRowSelect>
          <div className='form-row'>
            <label htmlFor='monthlyRent' className='form-label'>
              Monthly Fee (CAD$)
            </label>
            <input
              type='number'
              id='monthlyRent'
              name='monthlyRent'
              min='0'
              step='1'
              className='form-input'
              required
            />
          </div>

          {locationList.length > 0 ? (
            <div className='form-row'>
              <label htmlFor='locationId' className='form-label'>
                Location
              </label>
              <select
                name='locationId'
                id='locationId'
                className='form-select'
                onChange={(e) => {
                  const locationId = e.target.value
                  const chosenLocation = storeLocations.find(
                    (el) => el._id === locationId
                  )
                  setLocation(chosenLocation)
                }}
              >
                <option value='test'>init</option>
                {locationList.map((itemValue, index) => {
                  return (
                    <option key={itemValue._id} value={itemValue._id}>
                      {itemValue.name}
                    </option>
                  )
                })}
              </select>
            </div>
          ) : (
            <div>Vendor already has a contract at all locations</div>
          )}

          <div className='form-row'>
            <label htmlFor='startDate' className='form-label'>
              Expected Start Date:
            </label>
            <input
              type='date'
              id='startDate'
              name='startDate'
              defaultValue={day().format('YYYY-MM-DD')}
              onChange={(e) => {
                const selectedDate = e.target.value
                const dateInput = e.target
                  .closest('form')
                  .querySelector('input[name=endDate]')
                dateInput.value = day(selectedDate)
                  .add(3, 'month')
                  .subtract(1, 'day')
                  .format('YYYY-MM-DD')
              }}
            />
          </div>
          <div className='form-row'>
            <label htmlFor='endDate' className='form-label'>
              Earliest End Date:
            </label>
            <input
              type='date'
              id='endDate'
              name='endDate'
              defaultValue={day()
                .add(3, 'month')
                .subtract(1, 'day')
                .format('YYYY-MM-DD')}
            />
          </div>

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
export default AddContract
