import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import formatCurrency from '../utils/formatCurrency'
import { useQuery } from '@tanstack/react-query'
import { useState, Fragment } from 'react'
import { useNavigation } from 'react-router-dom'
import { userQuery } from './DashboardLayout'
import Table from 'react-bootstrap/Table'
import day from 'dayjs'

const contractsQuery = {
  queryKey: ['contracts'],
  queryFn: async () => {
    const { data } = await customFetch.get('/contracts')
    return data
  },
}

const paymentsQuery = {
  queryKey: ['payments'],
  queryFn: async () => {
    const { data } = await customFetch.get('/payments')
    return data
  },
}

export const loader = (queryClient) => async () => {
  const { user } = await queryClient.ensureQueryData(userQuery)
  await queryClient.ensureQueryData(contractsQuery)
  await queryClient.ensureQueryData(paymentsQuery)
  return null
}

// export const action =
//   (queryClient) =>
//   async ({ request }) => {
//     const formData = await request.formData()
//     // const data = Object.fromEntries(formData)
//     var data = {}
//     formData.forEach(function (value, key) {
//       set(data, key, value)
//     })

//     try {
//       await customFetch.post('/generate-orders/', data)
//       queryClient.invalidateQueries(['inventory'])
//       queryClient.invalidateQueries(['stats'])
//       queryClient.invalidateQueries(['orders'])
//       queryClient.invalidateQueries(['itemsales'])
//       toast.success('Test order successfully generated')
//       return redirect('/dashboard/all-orders')
//     } catch (error) {
//       toast.error(error?.response?.data?.msg)
//       return error
//     }
//   }

const ContractStatus = () => {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const { user } = useOutletContext()
  const { storeLocations } = useDashboardContext()
  const {
    data: { contracts },
  } = useQuery(contractsQuery)
  const {
    data: { paymentsDue },
  } = useQuery(paymentsQuery)
  // const contracts = data.contracts
  const [contractInd, setContractInd] = useState(0)

  const currLocation = storeLocations.find((location) => {
    return location._id == contracts[contractInd].location
  })

  console.log(contracts)

  if (contracts.length === 0) {
    return <h2>No contracts to display</h2>
  }

  return (
    <Wrapper>
      <h2>Contract Status</h2>
      <div className='contract'>
        <div className='contract-field'>
          <label>Location:</label>
          <span>{currLocation.name}</span>
        </div>
        <div className='contract-row'>
          <div className='contract-field'>
            <label>Type:</label>
            <span>{contracts[contractInd].contractType}</span>
          </div>
          <div className='contract-field'>
            <label>Monthly Fee:</label>
            <span>{formatCurrency(contracts[contractInd].monthlyRent)}</span>
          </div>
        </div>
        <div className='contract-row'>
          <div className='contract-field'>
            <label>Start Date:</label>
            <span>
              {day(contracts[contractInd].startDate).format('MMM DD, YYYY')}
            </span>
          </div>
          <div className='contract-field'>
            <label>Earliest End Date:</label>
            <span>
              {day(contracts[contractInd].endDate).format('MMM DD, YYYY')}
            </span>
          </div>
        </div>
      </div>
      <Table striped bordered hover>
        <colgroup span='2'></colgroup>
        <colgroup span='3'></colgroup>
        <thead>
          <tr>
            {/* <td rowspan='2'></td> */}
            <th colSpan='2' scope='colgroup'>
              Rental Period
            </th>
            <th colSpan='3' scope='colgroup'></th>
          </tr>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Amount</th>
            <th>Due date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paymentsDue &&
            paymentsDue.map((paymentObj) => {
              return (
                <Fragment key={paymentObj._id}>
                  <tr>
                    <td>
                      {`${day(paymentObj.forPeriodStart).format(
                        'DD-MMM-YYYY'
                      )}${!contracts[contractInd].started && ' (TBC)'}`}
                    </td>
                    <td>
                      {`${day(paymentObj.forPeriodEnd).format('DD-MMM-YYYY')}${
                        !contracts[contractInd].started && ' (TBC)'
                      }`}
                    </td>
                    <td>{formatCurrency(paymentObj.amountDue)}</td>
                    <td>
                      {day(paymentObj.forPeriodStart)
                        .subtract(7, 'day')
                        .format('DD-MMM-YYYY')}
                    </td>
                    <td>
                      {paymentObj.paid
                        ? 'PAID'
                        : day().isBefore(day(paymentObj.forPeriodStart))
                        ? 'DUE'
                        : day().isAfter(day(paymentObj.forPeriodStart))
                        ? 'PAST DUE'
                        : 'DUE'}
                    </td>
                  </tr>
                </Fragment>
              )
            })}
        </tbody>
      </Table>
    </Wrapper>
  )
}

export default ContractStatus
