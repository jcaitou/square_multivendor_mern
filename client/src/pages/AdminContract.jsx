import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import {
  Form,
  redirect,
  useLoaderData,
  useOutletContext,
  useNavigation,
} from 'react-router-dom'

import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import { useQuery } from '@tanstack/react-query'
import { UncontrolledFormRow } from '../components'
import { useState, Fragment } from 'react'

import { userQuery } from './DashboardLayout'
import Table from 'react-bootstrap/Table'
import day from 'dayjs'

export const singleContractQuery = (id) => {
  return {
    queryKey: ['contract', id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/contracts/${id}`)
      return data
    },
    enabled: !!id,
  }
}

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singleContractQuery(params.id))
      return params.id
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return redirect('/dashboard/admin/contracts')
    }
  }

// export const loader = (queryClient) => async () => {
//   await queryClient.ensureQueryData(singleContractQuery)
//   return null
// }

export const action =
  (queryClient) =>
  async ({ params, request }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    console.log(data)

    const confirmation = window.confirm('are you sure')

    if (confirmation) {
      try {
        await customFetch.post(`/contracts/adm/start/${params.id}`, data)
        queryClient.invalidateQueries(['contracts'])
        queryClient.invalidateQueries(['contract'])
        toast.success('Contract has started')
      } catch (error) {
        toast.error(error?.response?.data?.msg)
      }
    }
    return redirect('/dashboard/admin/contracts')
  }

const AdminContract = () => {
  const id = useLoaderData()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const { users } = useOutletContext()
  const { user, storeLocations } = useDashboardContext()

  const { contract } = useQuery(singleContractQuery(id))?.data
  console.log(contract)

  const contractLocation = storeLocations.find((location) => {
    return location._id == contract.location
  })

  const contractVendor = users.find((el) => {
    return el._id == contract.vendor
  })

  if (contract === undefined) {
    return <h2>No contracts to display</h2>
  }

  return (
    <Wrapper>
      <Form method='post'>
        <h2>Vendor Move-In</h2>

        <div className='contract'>
          <div className='contract-field'>
            <label>Vendor Name:</label>
            <span>{contractVendor.name}</span>
          </div>
          <div className='contract-field'>
            <label>Location:</label>
            <span>{contractLocation.name}</span>
          </div>
          <div className='contract-field'>
            <label>Type:</label>
            <span>{contract.contractType}</span>
          </div>
          <div className='contract-field'>
            <label>Monthly Fee:</label>
            <span>{formatCurrency(contract.monthlyRent)}</span>
          </div>

          {contract.started ? (
            <>
              <div className='contract-field'>
                <label>Start Date:</label>
                <span>{day(contract.startDate).format('MMM DD, YYYY')}</span>
              </div>
              <div className='contract-field'>
                <label>Earliest End Date:</label>
                <span>{day(contract.endDate).format('MMM DD, YYYY')}</span>
              </div>
            </>
          ) : (
            <>
              <div className='contract-field'>
                <label>Proposed Start Date:</label>
                <span>{day(contract.startDate).format('MMM DD, YYYY')}</span>
              </div>
              <div className='contract-row'>
                <div className='contract-field'>
                  <label htmlFor='startDate'>Actual Start Date:</label>
                  <input
                    type='date'
                    id='startDate'
                    name='startDate'
                    defaultValue={day(contract.startDate).format('YYYY-MM-DD')}
                    onChange={(e) => {
                      const selectedDate = e.target.value
                      const dateInput = e.target
                        .closest('form')
                        .querySelector('input[name=endDate]')
                      dateInput.value = day(selectedDate)
                        .add(3, 'month')
                        .subtract(1, 'day')
                        .format('YYYY-MM-DD')
                      console.log(selectedDate)
                    }}
                  />
                </div>
                <div className='contract-field'>
                  <label htmlFor='endDate'>Earliest End Date:</label>
                  <input
                    type='date'
                    id='endDate'
                    name='endDate'
                    defaultValue={day(contract.endDate).format('YYYY-MM-DD')}
                  />
                </div>
              </div>

              <button
                type='submit'
                className='btn btn-block'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'submitting...' : 'submit'}
              </button>
            </>
          )}
        </div>
      </Form>
    </Wrapper>
  )
}

export default AdminContract
