import Wrapper from '../assets/wrappers/ContractStatus'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useOutletContext, Link } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import Table from 'react-bootstrap/Table'
import day from 'dayjs'

const contractsQuery = {
  queryKey: ['contracts'],
  queryFn: async () => {
    const { data } = await customFetch.get('/contracts/adm')
    return data
  },
}

export const loader = (queryClient) => async () => {
  await queryClient.ensureQueryData(contractsQuery)
  return null
}

const AdminContracts = () => {
  const { users } = useOutletContext()
  const { user, storeLocations } = useDashboardContext()

  const { contracts } = useQuery(contractsQuery)?.data

  const toMoveIn = contracts.filter((el) => !el.started)
  const ongoing = contracts.filter((el) => el.started && el.willBeRenewed)
  const toMoveOut = contracts.filter((el) => el.started && !el.willBeRenewed)

  if (contracts === undefined || contracts.length === 0) {
    return <h2>No contracts to display</h2>
  }

  return (
    <Wrapper>
      <h2>Awaiting Move-In</h2>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Location</th>
            <th>Start Date</th>
            <th>Contract Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {toMoveIn &&
            toMoveIn.map((contract) => {
              const contractLocation = storeLocations.find((location) => {
                return location._id == contract.location
              })
              const vendor = users.find((el) => {
                return el._id == contract.vendor
              })
              return (
                <Fragment key={contract._id}>
                  <tr>
                    <td>{vendor.name}</td>
                    <td>{contractLocation.name}</td>
                    <td>{day(contract.startDate).format('DD-MMM-YYYY')}</td>
                    <td>{contract.contractType}</td>
                    <td>
                      {' '}
                      <Link to={`./${contract._id}`} className='btn edit-btn'>
                        Move In
                      </Link>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
        </tbody>
      </Table>

      <h2>Current Vendors</h2>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Location</th>
            <th>Start Date</th>
            <th>Earliest End Date</th>
            <th>Contract Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {ongoing &&
            ongoing.map((contract) => {
              const contractLocation = storeLocations.find((location) => {
                return location._id == contract.location
              })
              const vendor = users.find((el) => {
                return el._id == contract.vendor
              })
              return (
                <Fragment key={contract._id}>
                  <tr>
                    <td>{vendor.name}</td>
                    <td>{contractLocation.name}</td>
                    <td>{day(contract.startDate).format('DD-MMM-YYYY')}</td>
                    <td>{day(contract.endDate).format('DD-MMM-YYYY')}</td>
                    <td>{contract.contractType}</td>
                    <td>
                      {' '}
                      <Link to={`./${contract._id}`} className='btn edit-btn'>
                        View
                      </Link>
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

export default AdminContracts
