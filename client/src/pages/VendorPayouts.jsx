import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { userQuery } from './DashboardLayout'
import Table from 'react-bootstrap/Table'
import day from 'dayjs'

const payoutsQuery = {
  queryKey: ['payouts'],
  queryFn: async () => {
    const { data } = await customFetch.get('/payouts')
    return data
  },
}

export const loader = (queryClient) => async () => {
  const { user } = await queryClient.ensureQueryData(userQuery)
  await queryClient.ensureQueryData(payoutsQuery)
  return null
}

const VendorPayouts = () => {
  const { user } = useOutletContext()
  const { storeLocations } = useDashboardContext()
  const {
    data: { payouts },
  } = useQuery(payoutsQuery)

  payouts.sort((a, b) => {
    const locationA = a.contract.location.toUpperCase() // ignore upper and lowercase
    const locationB = b.contract.location.toUpperCase() // ignore upper and lowercase
    if (locationA < locationB) {
      return -1
    }
    if (locationA > locationB) {
      return 1
    }
    // names must be equal
    return 0
  })

  if (payouts.length === 0) {
    return <h2>No payouts to display</h2>
  }

  return (
    <Wrapper>
      <h2>Payouts</h2>
      <Table striped bordered hover>
        <colgroup span='2'></colgroup>
        <colgroup span='4'></colgroup>
        <thead>
          <tr>
            <th colSpan='2' scope='colgroup'>
              Reporting Period
            </th>
            <th colSpan='4' scope='colgroup'></th>
          </tr>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Amount</th>
            <th>Payout date</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts &&
            payouts.map((payoutObj) => {
              const currLocation = storeLocations.find((location) => {
                return location._id == payoutObj.contract.location
              })
              return (
                <Fragment key={payoutObj._id}>
                  <tr>
                    <td>
                      {day(payoutObj.forPeriodStart).format('DD-MMM-YYYY')}
                    </td>
                    <td>{day(payoutObj.forPeriodEnd).format('DD-MMM-YYYY')}</td>
                    <td>{formatCurrency(payoutObj.amountToPay)}</td>
                    <td>
                      {day(payoutObj.forPeriodEnd)
                        .add(7, 'day')
                        .format('DD-MMM-YYYY')}
                    </td>
                    <td>{currLocation.name}</td>
                    <td>{payoutObj.paid ? 'PAID' : 'CLEARING'}</td>
                  </tr>
                </Fragment>
              )
            })}
        </tbody>
      </Table>
    </Wrapper>
  )
}

export default VendorPayouts
