import { Fragment } from 'react'
import Table from 'react-bootstrap/Table'
import day from 'dayjs'
import formatCurrency from '../utils/formatCurrency'
import { Link } from 'react-router-dom'

function AdminPaymentTable({ context, paymentArray, storeLocations, users }) {
  return (
    <>
      <h2>{context}</h2>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Location</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Shelf</th>
            <th>{context == 'paid' ? 'Payment Ref' : 'Action'}</th>
          </tr>
        </thead>
        <tbody>
          {paymentArray &&
            paymentArray.map((payment) => {
              const paymentLocation = storeLocations.find((location) => {
                return location._id == payment.contract.location
              })
              const vendor = users.find((el) => {
                return el._id == payment.vendor
              })
              return (
                <Fragment key={payment._id}>
                  <tr>
                    <td>{vendor.name}</td>
                    <td>{paymentLocation.name}</td>
                    <td>{day(payment.forPeriodStart).format('DD-MMM-YYYY')}</td>
                    <td>{formatCurrency(payment.amountDue)}</td>
                    <td>{payment.contract.contractType}</td>
                    <td>
                      <Link to={`./${payment._id}`} className='btn edit-btn'>
                        {context == 'paid'
                          ? payment.paymentRef
                          : 'Make Payment'}
                      </Link>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
        </tbody>
      </Table>
    </>
  )
}

export default AdminPaymentTable
