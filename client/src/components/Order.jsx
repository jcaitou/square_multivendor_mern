import { Fragment } from 'react'
import Wrapper from '../assets/wrappers/Order'
import { useDashboardContext } from '../pages/DashboardLayout'
import day from 'dayjs'

const Order = ({ order }) => {
  const { storeLocations } = useDashboardContext()
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })

  return (
    <Wrapper>
      <div className='order-summary-info'>
        <span className='date'>
          {day(order.orderDate).format('YYYY MMM DD h:mm A')}
        </span>
        <span className='location'>
          {
            storeLocations.find((el) => {
              return el._id === order.location
            }).name
          }
        </span>
      </div>

      <div className='order-details'>
        {order.filteredOrderItems.map((item) => {
          return (
            <Fragment key={item._id}>
              <span className='order-item-name'>
                {item.itemName}
                {item.itemVariationName != '' && ` (${item.itemVariationName})`}
              </span>
              <span>{item.quantity}</span>
              <span>{CADMoney.format(item.basePrice / 100)}</span>
              <span>
                {item.totalDiscount === 0
                  ? '-'
                  : CADMoney.format(item.totalDiscount / 100)}
              </span>
              <span className='order-total'>
                {CADMoney.format(item.totalMoney / 100)}
              </span>
            </Fragment>
          )
        })}
        <span className='total-money'>
          {CADMoney.format(order.totalPrice / 100)}
        </span>
      </div>
    </Wrapper>
  )
}

export default Order
