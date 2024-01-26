import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import {
  Form,
  redirect,
  useLoaderData,
  useOutletContext,
  useNavigation,
} from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import { useQuery } from '@tanstack/react-query'
import { UncontrolledFormRow } from '../components'
import day from 'dayjs'

export const singlePaymentQuery = (id) => {
  return {
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/payments/${id}`)
      return data
    },
    enabled: !!id,
  }
}

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singlePaymentQuery(params.id))
      return params.id
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return redirect('/dashboard/admin/payments')
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
        await customFetch.post(`/payments/adm/${params.id}`, data)
        queryClient.invalidateQueries(['payments'])
        queryClient.invalidateQueries(['payment'])
        toast.success('Payment edited')
      } catch (error) {
        toast.error(error?.response?.data?.msg)
      }
    }
    return redirect('/dashboard/admin/payments')
  }

const AdminPayment = () => {
  const id = useLoaderData()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const { users } = useOutletContext()
  const { user, storeLocations } = useDashboardContext()
  const [editDates, setEditDates] = useState(false)
  const [makePayment, setMakePayment] = useState(false)

  const { payment } = useQuery(singlePaymentQuery(id))?.data

  const location = storeLocations.find((location) => {
    return location._id == payment.contract.location
  })

  const vendor = users.find((el) => {
    return el._id == payment.vendor
  })

  if (payment === undefined) {
    return <h2>No contract to display</h2>
  }

  return (
    <Wrapper>
      <Form method='post'>
        <h2>Membership Fee Receivable</h2>

        <div className='contract'>
          <div className='contract-field'>
            <label>Vendor Name:</label>
            <span>{vendor.name}</span>
          </div>
          <div className='contract-field'>
            <label>Location:</label>
            <span>{location.name}</span>
          </div>
          <div className='contract-field'>
            <label>Membership Type:</label>
            <span>{payment.contract.contractType}</span>
          </div>
          <div className='contract-field'>
            <label>Amount Due:</label>
            <span>{formatCurrency(payment.amountDue)}</span>
          </div>

          <button type='button' onClick={() => setEditDates(!editDates)}>
            Edit Dates
          </button>

          <div className='contract-field'>
            <label htmlFor='forPeriodStart'>Period Start:</label>
            {editDates ? (
              <input
                type='date'
                id='forPeriodStart'
                name='forPeriodStart'
                defaultValue={day(payment.forPeriodStart).format('YYYY-MM-DD')}
              />
            ) : (
              <span>{day(payment.forPeriodStart).format('MMM DD, YYYY')}</span>
            )}
          </div>
          <div className='contract-field'>
            <label htmlFor='forPeriodEnd'>Period End:</label>
            {editDates ? (
              <input
                type='date'
                id='forPeriodEnd'
                name='forPeriodEnd'
                defaultValue={day(payment.forPeriodEnd).format('YYYY-MM-DD')}
              />
            ) : (
              <span>{day(payment.forPeriodEnd).format('MMM DD, YYYY')}</span>
            )}
          </div>

          <div className='contract-field'>
            <label>Due Date:</label>
            <span>{day(payment.forPeriodStart).format('MMM DD, YYYY')}</span>
          </div>
          {payment.paid ? (
            <>
              <div className='contract-field'>
                <label>Payment Date:</label>
                <span>{day(payment.paymentDate).format('MMM DD, YYYY')}</span>
              </div>

              <div className='contract-field'>
                <label>Reference:</label>
                <span>{payment.paymentRef}</span>
              </div>
            </>
          ) : (
            <>
              <button
                type='button'
                onClick={() => setMakePayment(!makePayment)}
              >
                Make Payment
              </button>

              {makePayment && (
                <div className='contract-row'>
                  <div className='contract-field'>
                    <label htmlFor='paymentDate'>Payment Date:</label>
                    <input
                      type='date'
                      id='paymentDate'
                      name='paymentDate'
                      defaultValue={day().format('YYYY-MM-DD')}
                    />
                  </div>
                  <UncontrolledFormRow
                    type='text'
                    name='paymentRef'
                    labelText='payment reference'
                  ></UncontrolledFormRow>
                </div>
              )}
            </>
          )}
          {(editDates || (!payment.paid && makePayment)) && (
            <button
              type='submit'
              className='btn btn-block'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'submitting...' : 'submit'}
            </button>
          )}
        </div>
      </Form>
    </Wrapper>
  )
}

export default AdminPayment
