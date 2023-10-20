import Wrapper from '../assets/wrappers/Discount'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'

const Discount = ({ discount }) => {
  const fromDate = new Date(discount.pricingRuleData.validFromDate)
  const toDate = new Date(discount.pricingRuleData.validUntilDate)
  const today = new Date()
  let status = 'unset'
  if (today > fromDate && today < toDate) {
    status = 'active'
    console.log('✅ date is between the 2 dates')
  } else {
    console.log('⛔️ date is not in the range')
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
              <h5>{discount.pricingRuleData.name}</h5>
            </div>
            <div className='discount-status'>
              <p>{status}</p>
              <div className='discount-dates'>
                <p>Starts: {discount.pricingRuleData.validFromDate}</p>
                <p>Ends: {discount.pricingRuleData.validUntilDate}</p>
              </div>
            </div>
          </div>
        </header>
        <footer className='actions'>
          <Link to={`../edit-product/${discount.id}`} className='btn edit-btn'>
            <RiEditLine />
          </Link>
          <button type='submit' className='btn delete-btn'>
            <RiDeleteBinLine />
          </button>
        </footer>
      </label>
    </Wrapper>
  )
}

export default Discount
