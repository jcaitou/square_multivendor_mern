import { UncontrolledFormRow } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useNavigate, useLoaderData } from 'react-router-dom'
import { useDashboardContext } from './DashboardLayout'
import { useState } from 'react'
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

const AddDiscount = ({ queryClient }) => {
  const { items: products, cursor: cursorTemp, categories } = useLoaderData()
  const { user } = useDashboardContext()
  const [loadedProducts, setLoadedProducts] = useState(
    user.role === 'admin' ? categories : products
  )
  const [cursor, setCursor] = useState(cursorTemp)

  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [alwaysActive, setAlwaysActive] = useState(false)
  const [condition, setCondition] = useState('purchase-items')
  const [details, setDetails] = useState('percentage')
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

  const handleAddDiscountSubmit = async (event) => {
    event.preventDefault()
    const form = document.getElementById('discount-form')
    let formData = new FormData(form)
    const data = Object.fromEntries(formData)
    data.selectionList = selectedProducts

    try {
      setIsSubmitting(true)
      let response = await customFetch.post('/discounts', data)
      queryClient.invalidateQueries(['discounts'])
      toast.success('Discount added successfully')
      if (response.status >= 200 && response.status <= 299) {
        setTimeout(() => {
          setIsSubmitting(false)
          navigate('/dashboard/discounts', { replace: true })
        }, '1000')
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      setIsSubmitting(false)
      return error
    }
    return
  }

  return (
    <>
      <Wrapper>
        <Form
          method='post'
          className='form'
          id='discount-form'
          onSubmit={handleAddDiscountSubmit}
        >
          <h4 className='form-title'>add discount</h4>

          <div className='form-center'>
            <UncontrolledFormRow
              type='text'
              name='title'
              labelText='discount name'
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
                <label htmlFor='discountStart'>Start date:</label>
                <input
                  type='date'
                  id='discountStart'
                  name='discountStart'
                  required={!alwaysActive}
                  disabled={alwaysActive}
                />

                <label htmlFor='discountEnd'>End date:</label>
                <input
                  type='date'
                  id='discountEnd'
                  name='discountEnd'
                  required={!alwaysActive}
                  disabled={alwaysActive}
                />
              </div>

              <div className='choice-group text-center'>
                <div className='input-label-group'>
                  <input
                    type='checkbox'
                    name='alwaysActive'
                    id='alwaysActive'
                    value='true'
                    disabled={user.role === 'admin'}
                    onChange={() => {
                      setAlwaysActive(!alwaysActive)
                    }}
                  />
                  <label htmlFor='alwaysActive'>Always Active</label>
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
                    <select name='numItemsCondition' id='numItemsCondition'>
                      <option value='exact'>exactly</option>
                      <option value='min'>at least</option>
                    </select>
                    <input
                      type='number'
                      name='minItems'
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
                    name='eligibleItems'
                    value='all-items'
                    id='all-items'
                    defaultChecked={user.role !== 'admin'}
                    disabled={user.role === 'admin'}
                  />
                  <span>
                    <label htmlFor='all-items'>All Items</label>
                  </span>
                </div>

                <div className='discount-option'>
                  <input
                    type='radio'
                    name='eligibleItems'
                    id='specific-items'
                    value='specific-items'
                    defaultChecked={user.role === 'admin'}
                  />
                  <span>
                    <label htmlFor='specific-items'>
                      {selectedProducts.length > 0
                        ? `Specific Items: ${selectedProducts.length} selected`
                        : 'Specific Items:'}
                    </label>
                    <button
                      type='button'
                      className='btn product-selection-button'
                      onClick={(e) => {
                        const inputWrapper =
                          e.target.closest('.discount-option')
                        const input = inputWrapper.querySelector('input')
                        input.checked = true
                        setSelectProductsModalShow(true)
                      }}
                      disabled={isSubmitting}
                    >
                      {selectedProducts.length > 0
                        ? 'Change Products'
                        : 'Select Products'}
                    </button>
                    {/* {user.role === 'admin' ? (
                      <button
                        type='button'
                        className='btn product-selection-button'
                        onClick={(e) => {
                          const input = e.target
                          console.log(input)
                          setSelectProductsModalShow(true)
                        }}
                        disabled={isSubmitting}
                      >
                        {selectedProducts.length > 0
                          ? 'Change Products'
                          : 'Select Products'}
                      </button>
                    ) : (
                      <button
                        type='button'
                        className='btn product-selection-button'
                        onClick={(e) => {
                          const inputWrapper =
                            e.target.closest('.discount-option')
                          const input = inputWrapper.querySelector('input')
                          input.checked = true
                          console.log(input)
                          setSelectProductsModalShow(true)
                        }}
                        disabled={isSubmitting}
                      >
                        {selectedProducts.length > 0
                          ? 'Change Products'
                          : 'Select Products'}
                      </button>
                    )} */}
                  </span>
                </div>
              </div>
            </div>

            <h5>Discount details</h5>

            <div className='discount-option'>
              <input
                type='radio'
                name='discountDetails'
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
                  name='percentageOff'
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
                name='discountDetails'
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
                  name='amountOff'
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
                  name='minSpend'
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
                    name='minSpendAmount'
                    min='0'
                    required={minSpend}
                    disabled={minSpend == null}
                  />
                </span>
              </div>

              <div className='discount-option'>
                <input
                  type='radio'
                  name='minSpend'
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
