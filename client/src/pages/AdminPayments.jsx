import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useOutletContext } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'
import day from 'dayjs'
import { AdminPaymentTable } from '../components'

const paymentsQuery = {
  queryKey: ['payments'],
  queryFn: async () => {
    const { data } = await customFetch.get('/payments/adm')
    return data
  },
}

export const loader = (queryClient) => async () => {
  await queryClient.ensureQueryData(paymentsQuery)
  return null
}

const AdminPayments = () => {
  const { users } = useOutletContext()
  const { user, storeLocations } = useDashboardContext()

  const { paymentsDue: payments } = useQuery(paymentsQuery)?.data
  const today = day()

  const pastDue = payments.filter((el) => {
    return !el.paid && day(el.forPeriodStart).isAfter(today)
  })
  const due = payments.filter((el) => {
    return !el.paid && day(el.forPeriodStart).isBefore(today)
  })
  const paid = payments.filter((el) => el.paid)

  if (payments === undefined || payments.length === 0) {
    return <h2>No payments to display</h2>
  }

  return (
    <Wrapper>
      <AdminPaymentTable
        context='past due'
        paymentArray={pastDue}
        storeLocations={storeLocations}
        users={users}
      />

      <AdminPaymentTable
        context='due'
        paymentArray={due}
        storeLocations={storeLocations}
        users={users}
      />

      <AdminPaymentTable
        context='paid'
        paymentArray={paid}
        storeLocations={storeLocations}
        users={users}
      />
    </Wrapper>
  )
}

export default AdminPayments
