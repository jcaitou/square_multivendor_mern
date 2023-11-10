import { FormRow, FormRowSelect } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { JOB_STATUS, JOB_TYPE } from '../../../utils/constants'
import { Form, useNavigation, useNavigate, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

const AddProduct = () => {
  const navigate = useNavigate()
  // const navigation = useNavigation()
  // const isSubmitting = navigation.state === 'submitting'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productTitle, setProductTitle] = useState('')
  const [variationEdited, setVariationEdited] = useState(false)
  const [variations, setVariations] = useState([
    {
      name: '',
      sku: '',
      price: '',
      id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
    },
  ])

  const handleAddVariation = () => {
    setVariations([
      ...variations,
      {
        name: '',
        sku: '',
        price: '',
        id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      },
    ])
  }
  const handleDeleteVariation = (index) => {
    const list = [...variations]
    const newList = list.toSpliced(index, 1)
    setVariations(newList)
  }

  const handleVariationChange = (e, index) => {
    const { name, value } = e.target
    const list = [...variations]
    list[index][name] = value
    setVariations(list)
    setVariationEdited(true)
  }

  const handleProductTitleChange = (event) => {
    setProductTitle(event.target.value)
    if (!variationEdited) {
      const list = [...variations]
      list[0]['name'] = event.target.value
      setVariations(list)
    }
  }

  const handleAddProductSubmit = async (event) => {
    event.preventDefault()
    const newVariations = JSON.parse(JSON.stringify(variations))
    for (let i = 0; i < newVariations.length; i++) {
      newVariations[i].price = Math.round(newVariations[i].price * 100)
    }

    var newProductVariations = newVariations.map((variation, index) => ({
      type: 'ITEM_VARIATION',
      id: `#variation${index}`,
      itemVariationData: {
        name: variation.name || productTitle,
        sku: variation.sku || '',
        pricingType: 'FIXED_PRICING',
        priceMoney: {
          amount: variation.price || 0,
          currency: 'CAD',
        },
        trackInventory: true,
        availableForBooking: false,
        stockable: true,
      },
    }))

    var newProductObject = {
      type: 'ITEM',
      id: '#newitem',
      itemData: {
        name: productTitle,
        variations: newProductVariations,
      },
    }

    try {
      setIsSubmitting(true)
      let response = await customFetch.post('/products', newProductObject)
      setIsSubmitting(false)
      toast.success('Product added successfully')
      if (response.status >= 200 && response.status <= 299) {
        setTimeout(() => {
          navigate('/dashboard/all-products', { replace: true })
        }, '1000')
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <Wrapper>
      <Form method='post' className='form' onSubmit={handleAddProductSubmit}>
        <h4 className='form-title'>add product</h4>

        <div className='form-center'>
          <FormRow
            type='text'
            name='title'
            labelText='product name'
            value={productTitle}
            onChange={(e) => handleProductTitleChange(e)}
          />
          {variations.map((variation, index) => (
            <div className='form-variation' key={variation.id}>
              <FormRow
                type='text'
                name='name'
                labelText='variation name'
                value={variation.name}
                onChange={(e) => handleVariationChange(e, index)}
              />
              <FormRow
                type='text'
                name='sku'
                labelText='SKU'
                value={variation.sku}
                onChange={(e) => handleVariationChange(e, index)}
              />
              <FormRow
                type='number'
                name='price'
                labelText='price'
                value={variation.price}
                onChange={(e) => handleVariationChange(e, index)}
              />
              {variations.length > 1 && index > 0 && (
                <button
                  type='button'
                  onClick={() => handleDeleteVariation(index)}
                >
                  X
                </button>
              )}
            </div>
          ))}

          {/* <FormRowSelect
            name='jobType'
            labelText='job type'
            defaultValue={JOB_TYPE.FULL_TIME}
            list={Object.values(JOB_TYPE)}
          /> */}

          <button
            type='button'
            className='btn add-btn'
            onClick={handleAddVariation}
            disabled={isSubmitting}
          >
            <span>Add a Variation</span>
          </button>
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

export default AddProduct
