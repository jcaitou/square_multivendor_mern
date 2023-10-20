import { FormRow, FormRowSelect } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useNavigation, useNavigate, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

const AddDiscount = () => {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const [alwaysActive, setAlwaysActive] = useState(false)
  const [condition, setCondition] = useState('purchase-amount')
  const [conditionNum, setConditionNum] = useState(null)
  const [details, setDetails] = useState('percentage')
  const [detailsNum, setDetailsNum] = useState(null)
  const [selectProductsModalShow, setSelectProductsModalShow] = useState(false)

  console.log(details)

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

  const handleAddProductSubmit = async (event) => {
    event.preventDefault()
    var formData = new FormData(document.querySelector('#discount-form'))
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}, ${pair[1]}`)
    }

    let pricingRuleData = {
      name: formData.get('title'),
      discountId: '#new_discount',
      matchProductsId: '#new_match_products',
    }

    if (!formData.get('always-active')) {
      pricingRuleData.validFromDate = formData.get('discount-start')
      pricingRuleData.validFromLocalTime = '00:00:00'
      pricingRuleData.validUntilDate = formData.get('discount-end')
      pricingRuleData.validUntilLocalTime = '23:59:59'
    }

    if (formData.get('condition') == 'purchase-amount') {
    } else if (formData.get('condition') == 'purchase-items') {
    }

    if (formData.get('discount-details') == 'percentage') {
    } else if (formData.get('discount-details') == 'amount') {
    }

    console.log(formData.get('always-active'))
    console.log(pricingRuleData)
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

            <div className='choice-group'>
              <div className='input-label-group'>
                <input
                  type='checkbox'
                  name='always-active'
                  id='always-active'
                  value='true'
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
              <label htmlFor='specific-items'>Specific Items:</label>
              <button
                className='btn'
                onClick={() => setSelectProductsModalShow(true)}
              >
                Select Products
              </button>
            </span>
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
                required={details == 'amount'}
                disabled={details != 'amount'}
              />
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

function ProductSelectionModal({
  handleImportSubmit,
  handleFileImport,
  importFile,
  ...props
}) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Import Products by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Download a <span>sample CSV template</span> to see how you should
          format your data.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Cancel</Button>
        <Button onClick={handleImportSubmit} disabled={importFile == null}>
          Import CSV
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddDiscount
