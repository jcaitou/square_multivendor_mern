import Wrapper from '../assets/wrappers/Discount'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { Link, useNavigate } from 'react-router-dom'
import { useDashboardContext } from '../pages/DashboardLayout'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'

const Discount = ({
  discount,
  storewide,
  productSet,
  confirmDeleteDiscount,
}) => {
  const { user } = useDashboardContext()
  const navigate = useNavigate()
  let fromDate,
    toDate,
    decisionDate = new Date(),
    today = new Date()
  let status = 'unset'

  if (
    discount?.pricingRuleData?.validFromDate &&
    discount?.pricingRuleData?.validUntilDate
  ) {
    fromDate = new Date(
      discount.pricingRuleData.validFromDate + 'T00:00:00+08:00'
    )
    toDate = new Date(
      discount.pricingRuleData.validUntilDate + 'T23:59:59+08:00'
    )
    const dateOffset = 24 * 60 * 60 * 1000 * 1
    decisionDate.setTime(fromDate.getTime() - dateOffset)

    if (today >= fromDate && today <= toDate) {
      status = 'active'
    } else if (today < fromDate) {
      status = 'scheduled'
    } else if (today > toDate) {
      status = 'ended'
    }
  } else {
    status = 'always active'
  }

  return (
    <Wrapper>
      <label htmlFor={`product_${discount.id}`}>
        <header>
          <div className='info'>
            <div className='discount-title'>
              <h5>
                {storewide
                  ? discount.pricingRuleData.name.replace(
                      `[Administrator] `,
                      ''
                    )
                  : discount.pricingRuleData.name.replace(
                      `[${user.name}] `,
                      ''
                    )}
              </h5>
              {storewide && <p>Decide by: {decisionDate.toDateString()}</p>}
            </div>
            <div
              className={`discount-status status-${status.replace(' ', '-')}`}
            >
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
          {storewide ? (
            <input
              className='switch-checkbox'
              type='checkbox'
              defaultChecked={productSet.productSetData.productIdsAny.includes(
                user.squareId
              )}
              name={productSet.id}
              id={productSet.id}
              value={productSet.id}
              // disabled={today >= decisionDate}
              onChange={async (e) => {
                let opt = 'out of'
                if (e.target.checked) {
                  opt = 'in to'
                }

                e.target.setAttribute('disabled', true)

                try {
                  let response = await customFetch.post(
                    '/discounts/storewide',
                    {
                      productSetId: e.target.value,
                      optIn: e.target.checked,
                    }
                  )
                  toast.success(`You have opted ${opt} the storewide discount`)
                  e.target.removeAttribute('disabled')
                  navigate('/dashboard/discounts', { replace: true })
                } catch (error) {
                  console.log(error)
                  toast.error(error?.response?.data?.msg)
                }
              }}
            />
          ) : (
            <>
              <Link
                to={`../edit-discount/${discount.id}`}
                className='btn edit-btn'
              >
                <RiEditLine />
              </Link>
              <button
                type='submit'
                className='btn delete-btn'
                onClick={confirmDeleteDiscount}
              >
                <RiDeleteBinLine />
              </button>
            </>
          )}
        </footer>
      </label>
    </Wrapper>
  )
}

export default Discount
