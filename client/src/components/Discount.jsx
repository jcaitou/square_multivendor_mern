import Wrapper from '../assets/wrappers/Discount'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { useDashboardContext } from '../pages/DashboardLayout'

const Discount = ({ discount, confirmDeleteDiscount }) => {
  const { user } = useDashboardContext()
  let fromDate,
    toDate,
    today = new Date()
  let status = 'unset'
  console.log(fromDate)
  if (
    discount?.pricingRuleData?.validFromDate &&
    discount?.pricingRuleData?.validUntilDate
  ) {
    fromDate = new Date(discount.pricingRuleData.validFromDate)
    toDate = new Date(discount.pricingRuleData.validUntilDate)
    if (today > fromDate && today < toDate) {
      status = 'active'
      console.log('✅ date is between the 2 dates')
    } else if (today < fromDate) {
      status = 'scheduled'
    } else if (today > toDate) {
      status = 'ended'
    }
  } else {
    status = 'always active'
  }

  // const CADMoney = new Intl.NumberFormat('en-CA', {
  //   style: 'currency',
  //   currency: 'CAD',
  // })

  return (
    <Wrapper>
      <label htmlFor={`product_${discount.id}`}>
        <header>
          <div className='info'>
            <div className='discount-title'>
              <h5>
                {discount.pricingRuleData.name.replace(`[${user.name}] `, '')}
              </h5>
            </div>
            <div className='discount-status'>
              <p>{status}</p>
              {status != 'always active' && (
                <div className='discount-dates'>
                  <p>Starts: {discount.pricingRuleData.validFromDate}</p>
                  <p>Ends: {discount.pricingRuleData.validUntilDate}</p>
                </div>
              )}
            </div>
          </div>
        </header>
        <footer className='actions'>
          <Link to={`../edit-product/${discount.id}`} className='btn edit-btn'>
            <RiEditLine />
          </Link>
          <button
            type='submit'
            className='btn delete-btn'
            onClick={confirmDeleteDiscount}
          >
            <RiDeleteBinLine />
          </button>
        </footer>
      </label>
    </Wrapper>
  )
}

export default Discount
