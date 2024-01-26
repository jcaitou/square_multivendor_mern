import { FormRow } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useNavigate, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'
import { useLoaderData } from 'react-router-dom'
import { singleProductQuery } from './EditProduct'
import _ from 'lodash'

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ])
    console.log(params)
    if (_.isEmpty(params)) {
      return null
    } else {
      try {
        await queryClient.ensureQueryData(singleProductQuery(params.copy))
        return params.copy
      } catch (error) {
        toast.error(error?.response?.data?.msg)
        return redirect('/dashboard/all-products')
      }
    }
  }

const AddProduct = ({ queryClient }) => {
  const idToCopy = useLoaderData()

  //for the case where product is copied:
  const { data } = useQuery(singleProductQuery(idToCopy))
  const productToCopy = data?.object
  var variationsToCopy = null
  if (productToCopy) {
    variationsToCopy = productToCopy.itemData.variations.map((variation) => {
      return {
        name: variation.itemVariationData.name,
        sku: variation.itemVariationData.sku,
        price: (variation.itemVariationData.priceMoney.amount / 100).toFixed(2),
        id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      }
    })
  }

  const navigate = useNavigate()
  // const navigation = useNavigation()
  // const isSubmitting = navigation.state === 'submitting'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productTitle, setProductTitle] = useState(
    productToCopy ? productToCopy.itemData.name : ''
  )
  const [variationEdited, setVariationEdited] = useState(false)
  const [variations, setVariations] = useState(
    variationsToCopy || [
      {
        name: '',
        sku: '',
        price: '',
        id: `${Date.now()}${Math.floor(Math.random() * 10000)}`,
      },
    ]
  )

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
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['inventory'])
      queryClient.invalidateQueries(['stats'])
      setIsSubmitting(false)
      toast.success('Product added successfully')
      if (response?.status >= 200 && response?.status <= 299) {
        setTimeout(() => {
          navigate('/dashboard/all-products', { replace: true })
        }, '1000')
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      setIsSubmitting(false)
      return error
    }
  }

  return (
    <Wrapper>
      <Form method='post' className='form' onSubmit={handleAddProductSubmit}>
        <h4 className='form-title'>add product</h4>
        {productToCopy && (
          <>
            <p className='alert alert-danger' role='alert'>
              Note: The copied product is not saved until you press "Submit"!
            </p>
          </>
        )}

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
                maxLength={25}
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
