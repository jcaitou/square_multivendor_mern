import { FormRow, FormRowSelect } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { JOB_STATUS, JOB_TYPE } from '../../../utils/constants'
import { Form, useNavigation, useNavigate, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

const AddDiscount = () => {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [alwaysActive, setAlwaysActive] = useState(false)
  const [condition, setCondition] = useState('purchase-amount')
  console.log(condition)

  const [productTitle, setProductTitle] = useState('')
  const [pricingRuleData, setPricingRuleData] = useState([
    {
      name: '',
      discountId: '#new_discount',
      matchProductsId: '#new_match_products',
      validFromDate: '2023-10-18',
      validFromLocalTime: '00:00:00',
      validUntilDate: '2023-11-20',
      validUntilLocalTime: '23:59:59',
    },
  ])

  const handleProductTitleChange = (event) => {
    setProductTitle(event.target.value)
  }

  const handleAddProductSubmit = async (event) => {
    event.preventDefault()
    console.log('submit pressed')
    // const newVariations = JSON.parse(JSON.stringify(variations))
    // for (let i = 0; i < newVariations.length; i++) {
    //   newVariations[i].price = Math.round(newVariations[i].price * 100)
    // }

    // var newProductVariations = newVariations.map((variation, index) => ({
    //   type: 'ITEM_VARIATION',
    //   id: `#variation${index}`,
    //   itemVariationData: {
    //     name: variation.name || productTitle,
    //     sku: variation.sku || '',
    //     pricingType: 'FIXED_PRICING',
    //     priceMoney: {
    //       amount: variation.price || 0,
    //       currency: 'CAD',
    //     },
    //     trackInventory: true,
    //     availableForBooking: false,
    //     stockable: true,
    //   },
    // }))

    // var newProductObject = {
    //   type: 'ITEM',
    //   id: '#newitem',
    //   itemData: {
    //     name: productTitle,
    //     variations: newProductVariations,
    //   },
    // }

    // try {
    //   let response = await customFetch.post('/products', newProductObject)
    //   console.log(response)
    //   toast.success('Product added successfully')
    //   if (response.status >= 200 && response.status <= 299) {
    //     setTimeout(() => {
    //       navigate('/dashboard/all-products', { replace: true })
    //     }, '1000')
    //   }
    // } catch (error) {
    //   toast.error(error?.response?.data?.msg)
    //   return error
    // }
  }

  return (
    <Wrapper>
      <Form method='post' className='form' onSubmit={handleAddProductSubmit}>
        <h4 className='form-title'>add discount</h4>

        <div className='form-center'>
          <FormRow
            type='text'
            name='title'
            labelText='discount name'
            value={productTitle}
            onChange={(e) => handleProductTitleChange(e)}
          />

          <h5>When should the discount be active?</h5>

          <div className='form-choice'>
            <div
              className={
                alwaysActive
                  ? 'choice-group date-group inputs-disabled'
                  : 'choice-group date-group'
              }
            >
              <label htmlFor='discount-start'>Start date:</label>
              <input
                type='date'
                id='discount-start'
                name='discount-start'
                required={!alwaysActive}
                disabled={alwaysActive}
              />

              <label htmlFor='discount-end'>End date:</label>
              <input
                type='date'
                id='discount-end'
                name='discount-end'
                required={!alwaysActive}
                disabled={alwaysActive}
              />
            </div>

            <div className='choice-group'>
              <div className='input-label-group'>
                <input
                  type='checkbox'
                  name='always-active'
                  id='always-active'
                  checked={alwaysActive}
                  onChange={() => {
                    setAlwaysActive(!alwaysActive)
                  }}
                />
                <label htmlFor='always-active'>Always Active</label>
              </div>
            </div>
          </div>
          <h5>Condition to obtain discount:</h5>

          <div className='discount-options'>
            <div className='discount-option'>
              <input
                type='radio'
                name='condition'
                value='purchase-amount'
                id='purchase-amount'
                defaultChecked
                onChange={(e) => {
                  setCondition(e.target.value)
                }}
              />
              <span>
                <label htmlFor='purchase-amount'>Spend at least $ </label>
                <input
                  type='number'
                  name='min-spend'
                  min='0'
                  required={condition == 'purchase-amount'}
                  disabled={condition != 'purchase-amount'}
                />
              </span>
            </div>
            <div className='discount-option'>
              <input
                type='radio'
                name='condition'
                value='purchase-items'
                id='purchase-items'
                onChange={(e) => {
                  setCondition(e.target.value)
                }}
              />
              <span>
                <label htmlFor='purchase-items'>Purchase at least </label>
                <input
                  type='number'
                  name='min-items'
                  min='0'
                  required={condition == 'purchase-items'}
                  disabled={condition != 'purchase-items'}
                />
                items
              </span>
            </div>

            <div className='discount-option'>
              <input
                type='radio'
                name='condition'
                value='no-condition'
                id='no-condition'
                onChange={(e) => {
                  setCondition(e.target.value)
                }}
              />
              <span>
                <label htmlFor='no-condition'>No condition</label>
              </span>
            </div>
          </div>

          <h5>Eligible items</h5>

          <div className='discount-option'>
            <input
              type='radio'
              name='eligible-items'
              value='all-items'
              defaultChecked
            />
            <span>All Items</span>
          </div>

          <div className='discount-option'>
            <input type='radio' name='eligible-items' value='specific-items' />
            <span>Specific Items</span>
          </div>

          <h5>Discount details</h5>

          <div className='discount-option'>
            <input
              type='radio'
              name='discount-details'
              value='percentage'
              defaultChecked
            />
            <span>
              Apply{' '}
              <input type='number' name='percentage-off' min='0' max='100' />%
              off to all eligible items
            </span>
          </div>
          <div className='discount-option'>
            <input type='radio' name='discount-details' value='amount' />
            <span>
              Apply $
              <input type='number' name='amount-off' min='0' />
              discount to each eligible item
            </span>
          </div>

          <button
            type='submit'
            className='btn btn-block form-btn '
            disabled={isSubmitting}
          >
            {isSubmitting ? 'submitting...' : 'submit'}
          </button>
        </div>
      </Form>
    </Wrapper>
  )
}

export default AddDiscount
