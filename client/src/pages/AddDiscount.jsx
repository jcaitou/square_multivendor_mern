import { FormRow } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import {
  Form,
  useNavigation,
  useNavigate,
  useLoaderData,
  redirect,
} from 'react-router-dom'
import { useDashboardContext } from './DashboardLayout'
import { useState, Fragment } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import ProductSelectionModal from '../components/ProductSelectionModal'

export const loader = async ({ request }) => {
  try {
    const {
      data: { items, cursor, matchedVariationIds },
    } = await customFetch.get('/products')

    const {
      data: { categories },
    } = await customFetch.get('/discounts/discount-categories')
    console.log(categories)
    return {
      items,
      cursor,
      categories,
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AddDiscount = () => {
  const { items: products, cursor: cursorTemp, categories } = useLoaderData()
  const { user } = useDashboardContext()
  const [loadedProducts, setLoadedProducts] = useState(
    user.role === 'admin' ? categories : products
  )
  const [cursor, setCursor] = useState(cursorTemp)

  // console.log(categories)

  // const getCategories = async () => {
  //   const response = await customFetch.get('discounts/discount-categories')
  //   console.log(response.data)
  //   setLoadedProducts(response.data.users)
  // }

  // if (user.role === 'admin') {
  //   getCategories()
  // }

  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [alwaysActive, setAlwaysActive] = useState(false)
  const [condition, setCondition] = useState('purchase-items')
  const [conditionNum, setConditionNum] = useState(null)
  const [details, setDetails] = useState('percentage')
  const [detailsNum, setDetailsNum] = useState(null)
  const [minSpend, setMinSpend] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectProductsModalShow, setSelectProductsModalShow] = useState(false)

  const selectProducts = () => {
    let productSelection = Array.from(
      document.querySelectorAll(
        '#product-selection-table input[type="checkbox"][name="product-selection"]:checked'
      )
    )
    setSelectedProducts(
      productSelection.map((el) => {
        return el.value
      })
    )
    setSelectProductsModalShow(false)
  }

  const handleAddProductSubmit = async (event) => {
    event.preventDefault()
    var formData = new FormData(document.querySelector('#discount-form'))
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`)
    }

    let pricingRuleData = {
      name: `[${user.name}] ${formData.get('title')}`,
      discountId: '#new_discount',
      matchProductsId: '#new_match_products',
    }

    let discountData = {
      name: `[${user.name}] ${formData.get('title')}`,
      modifyTaxBasis: 'MODIFY_TAX_BASIS',
    }

    let productSetData = {}

    if (!formData.get('always-active')) {
      pricingRuleData.validFromDate = formData.get('discount-start')
      pricingRuleData.validFromLocalTime = '00:00:00'
      pricingRuleData.validUntilDate = formData.get('discount-end')
      pricingRuleData.validUntilLocalTime = '23:59:59'
    }

    if (formData.get('condition') == 'purchase-items') {
      if (formData.get('num-items-condition') == 'exact') {
        productSetData.quantityExact = formData.get('min-items')
      } else if (formData.get('num-items-condition') == 'min') {
        productSetData.quantityMin = formData.get('min-items')
      }
    }

    if (formData.get('eligible-items') == 'all-items') {
      productSetData.productIdsAny = [user.squareId]
    } else {
      productSetData.productIdsAny = selectedProducts
    }

    if (formData.get('discount-details') == 'percentage') {
      discountData.discountType = 'FIXED_PERCENTAGE'
      discountData.percentage = formData.get('percentage-off')
    } else if (formData.get('discount-details') == 'amount') {
      discountData.discountType = 'FIXED_AMOUNT'
      discountData.amountMoney = {
        amount: Math.round(parseFloat(formData.get('amount-off')) * 100),
        currency: 'CAD',
      }
    }

    if (formData.get('min-spend') == 'min-spend-true') {
      pricingRuleData.minimumOrderSubtotalMoney = {
        amount: Math.round(parseFloat(formData.get('min-spend-amount')) * 100),
        currency: 'CAD',
      }
    }

    let pricingRuleObj = {
      type: 'PRICING_RULE',
      id: '#new_pricing_rule',
      pricingRuleData: pricingRuleData,
    }

    let discountObj = {
      type: 'DISCOUNT',
      id: '#new_discount',
      discountData: discountData,
    }

    let productSetObj = {
      type: 'PRODUCT_SET',
      id: '#new_match_products',
      productSetData: productSetData,
    }

    console.log(
      pricingRuleData,
      discountData,
      productSetData,
      formData.get('min-spend')
    )

    try {
      let response = await customFetch.post('/discounts', {
        pricingRuleObj,
        discountObj,
        productSetObj,
      })
      console.log(response)
      toast.success('Discount added successfully')
      if (response.status >= 200 && response.status <= 299) {
        setTimeout(() => {
          navigate('/dashboard/discounts', { replace: true })
        }, '1000')
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <>
      <Wrapper>
        <Form
          method='post'
          className='form'
          id='discount-form'
          onSubmit={handleAddProductSubmit}
        >
          <h4 className='form-title'>add discount</h4>

          <div className='form-center'>
            <FormRow type='text' name='title' labelText='discount name' />

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

              <div className='choice-group text-center'>
                <div className='input-label-group'>
                  <input
                    type='checkbox'
                    name='always-active'
                    id='always-active'
                    value='true'
                    onChange={() => {
                      setAlwaysActive(!alwaysActive)
                    }}
                  />
                  <label htmlFor='always-active'>Always Active</label>
                </div>
              </div>
            </div>
            <h5>Condition to obtain discount:</h5>
            <div className='form-choice'>
              <div className='choice-group discount-options'>
                <div className='discount-option'>
                  <input
                    type='radio'
                    name='condition'
                    value='purchase-items'
                    id='purchase-items'
                    defaultChecked
                    onChange={(e) => {
                      setCondition(e.target.value)
                    }}
                  />
                  <span>
                    <label htmlFor='purchase-items'>Purchase</label>
                    <select name='num-items-condition' id='num-items-condition'>
                      <option value='exact'>exactly</option>
                      <option value='min'>at least</option>
                    </select>
                    <input
                      type='number'
                      name='min-items'
                      min='0'
                      required={condition == 'purchase-items'}
                      disabled={condition != 'purchase-items'}
                    />
                    items out of:
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
                    <label htmlFor='no-condition'>
                      Purchase any number of items out of:
                    </label>
                  </span>
                </div>
              </div>

              <div className='choice-group'>
                <div className='discount-option'>
                  <input
                    type='radio'
                    name='eligible-items'
                    value='all-items'
                    id='all-items'
                    defaultChecked
                  />
                  <span>
                    <label htmlFor='all-items'>All Items</label>
                  </span>
                </div>

                <div className='discount-option'>
                  <input
                    type='radio'
                    name='eligible-items'
                    id='specific-items'
                    value='specific-items'
                  />
                  <span>
                    <label htmlFor='specific-items'>
                      {selectedProducts.length > 0
                        ? `Specific Items: ${selectedProducts.length} selected`
                        : 'Specific Items:'}
                    </label>
                    {user.role === 'admin' ? (
                      <button
                        type='button'
                        className='btn product-selection-button'
                        onClick={() => setSelectProductsModalShow(true)}
                      >
                        {selectedProducts.length > 0
                          ? 'Change Products'
                          : 'Select Products'}
                      </button>
                    ) : (
                      <button
                        type='button'
                        className='btn product-selection-button'
                        onClick={() => setSelectProductsModalShow(true)}
                      >
                        {selectedProducts.length > 0
                          ? 'Change Products'
                          : 'Select Products'}
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <h5>Discount details</h5>

            <div className='discount-option'>
              <input
                type='radio'
                name='discount-details'
                id='percentage'
                value='percentage'
                defaultChecked
                onChange={(e) => {
                  setDetails(e.target.value)
                }}
              />
              <span>
                <label htmlFor='percentage'>Apply</label>
                <input
                  type='number'
                  name='percentage-off'
                  min='0'
                  max='100'
                  step='0.1'
                  required={details == 'percentage'}
                  disabled={details != 'percentage'}
                />
                % off to all eligible items
              </span>
            </div>
            <div className='discount-option'>
              <input
                type='radio'
                name='discount-details'
                id='amount'
                value='amount'
                onChange={(e) => {
                  setDetails(e.target.value)
                }}
              />
              <span>
                <label htmlFor='amount'>Apply $</label>
                <input
                  type='number'
                  name='amount-off'
                  min='0'
                  step='0.01'
                  required={details == 'amount'}
                  disabled={details != 'amount'}
                />
                discount to each eligible item
              </span>
            </div>

            <h5>Minimum spend</h5>

            <div className='form-choice'>
              <div className='discount-option'>
                <input
                  type='radio'
                  name='min-spend'
                  value='min-spend-true'
                  id='min-spend-true'
                  onChange={(e) => {
                    setMinSpend(e.target.value)
                  }}
                />
                <span>
                  <label htmlFor='min-spend-true'>Spend at least $ </label>
                  <input
                    type='number'
                    name='min-spend-amount'
                    min='0'
                    required={minSpend}
                    disabled={minSpend == null}
                  />
                </span>
              </div>

              <div className='discount-option'>
                <input
                  type='radio'
                  name='min-spend'
                  value='min-spend-false'
                  id='min-spend-false'
                  defaultChecked
                  onChange={(e) => {
                    setMinSpend(null)
                  }}
                />
                <span>
                  <label htmlFor='min-spend-false'>No minimum</label>
                </span>
              </div>
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

      <ProductSelectionModal
        show={selectProductsModalShow}
        loadedProducts={loadedProducts}
        setLoadedProducts={setLoadedProducts}
        cursor={cursor}
        setCursor={setCursor}
        selectedProducts={selectedProducts}
        selectProducts={selectProducts}
        onHide={() => setSelectProductsModalShow(false)}
      />
    </>
  )
}

export default AddDiscount
