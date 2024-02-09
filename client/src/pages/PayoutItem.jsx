import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import {
  Form,
  useNavigation,
  useOutletContext,
  useLoaderData,
  redirect,
} from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import { useQuery } from '@tanstack/react-query'
import { useState, Fragment } from 'react'
import { userQuery } from './DashboardLayout'
import Table from 'react-bootstrap/Table'
import { UncontrolledFormRow } from '../components'
import day from 'dayjs'

const singlePayoutQuery = (id) => {
  return {
    queryKey: ['payouts', id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/payouts/${id}`)
      return data
    },
  }
}

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singlePayoutQuery(params.id))
      return params.id
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return redirect('/dashboard/payouts')
    }
  }

export const action =
  (queryClient) =>
  async ({ params, request }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    const confirmation = window.confirm('are you sure')

    if (confirmation) {
      try {
        await customFetch.post(`/payouts/adm/${params.id}`, data)
        queryClient.invalidateQueries(['payouts'])
        toast.success('Payout edited')
      } catch (error) {
        toast.error(error?.response?.data?.msg)
      }
    }
    return redirect('/dashboard/admin/payouts')
  }

const PayoutItem = () => {
  const id = useLoaderData()
  const {
    data: { payout },
  } = useQuery(singlePayoutQuery(id))

  console.log(payout)

  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const { user } = useOutletContext()
  const { storeLocations } = useDashboardContext()

  const currLocation = storeLocations.find((location) => {
    return location._id == payout.contract.location
  })

  if (!payout) {
    return <h2>No contracts to display</h2>
  }

  return (
    <Wrapper>
      <Form method='post'>
        <h2>Payout Status</h2>
        <div className='contract'>
          <div className='contract-field'>
            <label>Location:</label>
            <span>{currLocation.name}</span>
          </div>
          <div className='contract-row'>
            <div className='contract-field'>
              <label>Income Period:</label>
              <span>{`${day(payout.forPeriodStart).format(
                'MMM DD, YYYY'
              )} to ${day(payout.forPeriodEnd).format('MMM DD, YYYY')}`}</span>
            </div>
          </div>
          <div className='contract-field'>
            <label>Amount:</label>
            <span>{formatCurrency(payout.amountToPay)}</span>
          </div>

          <div className='contract-row'>
            <div className='contract-field'>
              <label htmlFor='startDate'>Payment Date:</label>
              {payout.paid ? (
                <span>{day().format('YYYY-MM-DD')}</span>
              ) : (
                <input
                  type='date'
                  id='startDate'
                  name='startDate'
                  defaultValue={day().format('YYYY-MM-DD')}
                />
              )}
            </div>
          </div>
          {payout.paid ? (
            <>
              <div className='contract-field'>
                <label htmlFor='reference'>Payment Reference:</label>
                <span>{payout.payoutRef}</span>
              </div>
            </>
          ) : (
            <UncontrolledFormRow
              type='text'
              name='reference'
              labelText='payment reference'
            ></UncontrolledFormRow>
          )}

          {!payout.paid && (
            <button
              type='submit'
              className='btn btn-block'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'submitting...' : 'submit'}
            </button>
          )}

          {/* {payout.paid ? (
            <>
              <div className='contract-row'>
                <div className='contract-field'>
                  <label htmlFor='startDate'>Payment Date:</label>
                  <input
                    type='date'
                    id='startDate'
                    name='startDate'
                    defaultValue={day().format('YYYY-MM-DD')}
                  />
                </div>
              </div>
              <UncontrolledFormRow
                type='text'
                name='reference'
                labelText='payment reference'
              ></UncontrolledFormRow>

              <button
                type='submit'
                className='btn btn-block'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'submitting...' : 'submit'}
              </button>
            </>
          ) : (
            <>
              <div className='contract-row'>
                <div className='contract-field'>
                  <label htmlFor='startDate'>Payment Date:</label>
                  <input
                    type='date'
                    id='startDate'
                    name='startDate'
                    defaultValue={day().format('YYYY-MM-DD')}
                  />
                </div>
              </div>
              <UncontrolledFormRow
                type='text'
                name='reference'
                labelText='payment reference'
              ></UncontrolledFormRow>

              <button
                type='submit'
                className='btn btn-block'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'submitting...' : 'submit'}
              </button>
            </>
          )} */}
        </div>
      </Form>
    </Wrapper>
  )
}

export default PayoutItem
