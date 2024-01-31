import Wrapper from '../assets/wrappers/DashboardFormPage'
import {
  Form,
  useNavigation,
  useNavigate,
  useLoaderData,
} from 'react-router-dom'
import { useDashboardContext } from './DashboardLayout'
import { useState, Fragment } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import ProductSelectionModal from '../components/ProductSelectionModal'

export const loader = async ({ request, params }) => {
  try {
    const {
      data: { items, cursor, matchedVariationIds },
    } = await customFetch.get('/products')
    const {
      data: { categories },
    } = await customFetch.get('/discounts/discount-categories')
    const { data: discount } = await customFetch.get(`/discounts/${params.id}`)

    return {
      items,
      categories,
      cursor,
      discount,
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const EditDiscount = ({ queryClient }) => {
  const {
    items: products,
    categories,
    cursor: cursorTemp,
    discount,
  } = useLoaderData()
  const { user } = useDashboardContext()

  const [loadedProducts, setLoadedProducts] = useState(
    user.role === 'admin' ? categories : products
  )
  const [cursor, setCursor] = useState(cursorTemp)

  const originalPricingRule = discount.objects.filter(
    (el) => el.type === 'PRICING_RULE'
  )[0]
  const originalDiscount = discount.objects.filter(
    (el) => el.type === 'DISCOUNT'
  )[0]
  const originalProductSet = discount.objects.filter(
    (el) => el.type === 'PRODUCT_SET'
  )[0]

  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [alwaysActive, setAlwaysActive] = useState(
    originalPricingRule?.pricingRuleData?.validFromDate == null
  )
  const [condition, setCondition] = useState(
    originalProductSet.productSetData.quantityExact > 0 ||
      originalProductSet.productSetData.quantityMin > 0
      ? 'purchase-items'
      : 'no-condition'
  )
  const [details, setDetails] = useState(
    originalDiscount.discountData.percentage ? 'percentage' : 'amount'
  )
  const [minSpend, setMinSpend] = useState(
    originalPricingRule.pricingRuleData.minimumOrderSubtotalMoney != null
  )
  const defaultAllItems =
    user.role !== 'admin' &&
    originalProductSet.productSetData.productIdsAny.length == 1 &&
    originalProductSet.productSetData.productIdsAny[0] == user.squareId
  const [selectedProducts, setSelectedProducts] = useState(
    defaultAllItems ? [] : originalProductSet.productSetData.productIdsAny
  )
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
      let response = await customFetch.patch(
        `/discounts/${originalPricingRule.id}`,
        data
      )
      queryClient.invalidateQueries(['discounts'])
      toast.success('Discount edited successfully')
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
          <h4 className='form-title'>edit discount</h4>

          <div className='form-center'>
            <div className='form-row'>
              <label htmlFor='title' className='form-label'>
                discount name
              </label>
              <input
                type='text'
                id='title'
                name='title'
                className='form-input'
                required
                defaultValue={originalPricingRule.pricingRuleData.name.replace(
                  `[${user.name}] `,
                  ''
                )}
              />
            </div>

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
                  defaultValue={
                    originalPricingRule.pricingRuleData.validFromDate
                  }
                />

                <label htmlFor='discountEnd'>End date:</label>
                <input
                  type='date'
                  id='discountEnd'
                  name='discountEnd'
                  required={!alwaysActive}
                  disabled={alwaysActive}
                  defaultValue={
                    originalPricingRule.pricingRuleData.validUntilDate
                  }
                />
              </div>

              <div className='choice-group text-center'>
                <div className='input-label-group'>
                  <input
                    type='checkbox'
                    name='alwaysActive'
                    id='alwaysActive'
                    value='true'
                    defaultChecked={
                      originalPricingRule?.pricingRuleData?.validFromDate ==
                      null
                    }
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
                    defaultChecked={
                      originalProductSet.productSetData.quantityExact > 0 ||
                      originalProductSet.productSetData.quantityMin > 0
                    }
                    onChange={(e) => {
                      setCondition(e.target.value)
                    }}
                  />
                  <span>
                    <label htmlFor='purchase-items'>Purchase</label>
                    <select
                      name='numItemsCondition'
                      id='numItemsCondition'
                      defaultValue={
                        originalProductSet.productSetData.quantityExact > 0
                          ? 'exact'
                          : originalProductSet.productSetData.quantityMin > 0
                          ? 'min'
                          : ''
                      }
                    >
                      <option value='exact'>exactly</option>
                      <option value='min'>at least</option>
                    </select>
                    <input
                      type='number'
                      name='minItems'
                      min='0'
                      defaultValue={
                        originalProductSet.productSetData.quantityExact ||
                        originalProductSet.productSetData.quantityMin
                      }
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
                    defaultChecked={
                      originalProductSet.productSetData.quantityExact == null &&
                      originalProductSet.productSetData.quantityMin == null
                    }
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
                    defaultChecked={defaultAllItems}
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
                    defaultChecked={!defaultAllItems}
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
                      disabled={isSubmitting}
                      onClick={(e) => {
                        const inputWrapper =
                          e.target.closest('.discount-option')
                        const input = inputWrapper.querySelector('input')
                        input.checked = true
                        setSelectProductsModalShow(true)
                      }}
                    >
                      {selectedProducts.length > 0
                        ? 'Change Products'
                        : 'Select Products'}
                    </button>
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
                defaultChecked={
                  originalDiscount.discountData.percentage != null
                }
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
                  defaultValue={originalDiscount.discountData.percentage}
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
                defaultChecked={
                  originalDiscount.discountData.amountMoney != null
                }
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
                  defaultValue={
                    originalDiscount.discountData.amountMoney?.amount
                      ? originalDiscount.discountData.amountMoney?.amount /
                        100.0
                      : ''
                  }
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
                  defaultChecked={
                    originalPricingRule.pricingRuleData
                      .minimumOrderSubtotalMoney != null
                  }
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
                    defaultValue={
                      originalPricingRule.pricingRuleData
                        ?.minimumOrderSubtotalMoney?.amount
                        ? originalPricingRule.pricingRuleData
                            ?.minimumOrderSubtotalMoney?.amount / 100.0
                        : ''
                    }
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
                  defaultChecked={
                    originalPricingRule.pricingRuleData
                      .minimumOrderSubtotalMoney == null
                  }
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

// function ProductSelectionModal({
//   loadedProducts,
//   setLoadedProducts,
//   cursor,
//   setCursor,
//   selectedProducts,
//   selectProducts,
//   ...props
// }) {
//   const CADMoney = new Intl.NumberFormat('en-CA', {
//     style: 'currency',
//     currency: 'CAD',
//   })

//   const productSearch = (e) => {
//     console.log(e.target.value)
//     const searchQuery = e.target.value.toLowerCase()
//     const allRows = document.querySelectorAll(
//       '#product-selection-table tbody tr'
//     )
//     allRows.forEach((row) => {
//       if (row.dataset.product.toLowerCase().includes(searchQuery)) {
//         row.style.display = 'table-row'
//       } else {
//         row.style.display = 'none'
//       }
//     })
//   }

//   return (
//     <Modal
//       {...props}
//       size='lg'
//       aria-labelledby='contained-modal-title-vcenter'
//       centered
//     >
//       <ProductSelectionWrapper>
//         <Modal.Header closeButton>
//           <Modal.Title id='contained-modal-title-vcenter'>
//             Select Products
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <input
//             type='search'
//             name='search'
//             onChange={(e) => productSearch(e)}
//           />
//           <div className='product-selection-table' id='product-selection-table'>
//             <InfiniteScroll
//               dataLength={loadedProducts.length}
//               next={async () => {
//                 //console.log(products, cursor)
//                 const { data } = await customFetch.get(
//                   `/products?cursor=${cursor}`
//                 )
//                 setLoadedProducts(loadedProducts.concat(data.items))
//                 setCursor(data.cursor)
//                 console.log(data)
//                 //console.log(products)
//                 return
//               }}
//               hasMore={cursor != ''}
//               scrollableTarget='product-selection-table'
//               loader={<h4>Loading...</h4>}
//             >
//               <Table striped bordered hover>
//                 <thead>
//                   <tr>
//                     <th>
//                       <input
//                         type='checkbox'
//                         name='all-products'
//                         id='all-products'
//                         value='all-products'
//                         onChange={(e) => {
//                           let allCheckboxes = document.querySelectorAll(
//                             '#product-selection-table input[type="checkbox"][name="product-selection"]'
//                           )
//                           allCheckboxes.forEach((checkbox) => {
//                             checkbox.checked = e.target.checked
//                           })
//                         }}
//                       />
//                     </th>
//                     <th>Name</th>
//                     <th>SKU</th>
//                     <th>Price</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loadedProducts.map((product) => {
//                     let priceMin, priceMax
//                     if (product.itemData.variations.length != 1) {
//                       priceMin = product.itemData.variations.reduce(function (
//                         prev,
//                         curr
//                       ) {
//                         return prev.itemVariationData.priceMoney.amount <
//                           curr.itemVariationData.priceMoney.amount
//                           ? prev
//                           : curr
//                       })
//                       priceMax = product.itemData.variations.reduce(function (
//                         prev,
//                         curr
//                       ) {
//                         return prev.itemVariationData.priceMoney.amount <
//                           curr.itemVariationData.priceMoney.amount
//                           ? curr
//                           : prev
//                       })
//                     }
//                     return (
//                       <Fragment key={product.id}>
//                         <tr data-product={product.itemData.name}>
//                           <td>
//                             <input
//                               type='checkbox'
//                               name='product-selection'
//                               id={product.id}
//                               value={product.id}
//                               defaultChecked={selectedProducts.includes(
//                                 product.id
//                               )}
//                             />
//                           </td>
//                           <td className='has-label'>
//                             <label htmlFor={product.id}>
//                               {product.itemData.name}
//                             </label>
//                           </td>
//                           <td className='has-label'>
//                             <label htmlFor={product.id}>
//                               {product.itemData.variations.length == 1
//                                 ? product.itemData.variations[0]
//                                     .itemVariationData.sku
//                                 : `${product.itemData.variations.length} variations`}
//                             </label>
//                           </td>
//                           <td className='has-label'>
//                             <label htmlFor={product.id}>
//                               {product.itemData.variations.length == 1
//                                 ? CADMoney.format(
//                                     product.itemData.variations[0]
//                                       .itemVariationData.priceMoney.amount / 100
//                                   )
//                                 : `${CADMoney.format(
//                                     priceMin.itemVariationData.priceMoney
//                                       .amount / 100
//                                   )} - ${CADMoney.format(
//                                     priceMax.itemVariationData.priceMoney
//                                       .amount / 100
//                                   )}`}
//                             </label>
//                           </td>
//                         </tr>
//                       </Fragment>
//                     )
//                   })}
//                 </tbody>
//               </Table>
//             </InfiniteScroll>
//           </div>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button onClick={selectProducts}>Done</Button>
//         </Modal.Footer>
//       </ProductSelectionWrapper>
//     </Modal>
//   )
// }

export default EditDiscount
