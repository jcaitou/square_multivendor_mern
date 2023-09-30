import { FormRow, FormRowSelect } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { useLoaderData } from 'react-router-dom'
import { JOB_STATUS, JOB_TYPE } from '../../../utils/constants'
import { Form, useNavigation, useNavigate, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import _ from 'lodash'

export const loader = async ({ params }) => {
  try {
    const { data } = await customFetch.get(`/products/${params.id}`)
    return data
  } catch (error) {
    toast.error(error.response.data.msg)
    return redirect('/dashboard/all-jobs')
  }
}

const EditProduct = () => {
  const { object: product } = useLoaderData()
  const [productData, setProductData] = useState(product)
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  console.log(productData)

  const handleEditProduct = (e, objectProperty) => {
    const newProductData = { ...productData }
    _.set(newProductData, objectProperty, e.target.value)
    setProductData(newProductData)
  }

  const handleAddVariation = () => {
    const newProductData = { ...productData }
    const newVariation = {
      type: 'ITEM_VARIATION',
      id: `#${Date.now()}${Math.floor(Math.random() * 10000)}`,
      itemVariationData: {
        itemId: newProductData.id,
        name: '',
        sku: '',
        pricingType: 'FIXED_PRICING',
        priceMoney: {
          amount: 0,
          currency: 'CAD',
        },
        trackInventory: true,
        availableForBooking: false,
        sellable: true,
        stockable: true,
      },
    }
    newProductData.itemData.variations.push(newVariation)
    setProductData(newProductData)
  }

  const handleDeleteVariation = (index) => {
    const variations = [...productData.itemData.variations]
    const newVariations = variations.toSpliced(index, 1)

    const newProductData = { ...productData }
    newProductData.itemData.variations = newVariations
    setProductData(newProductData)
  }

  const handleEditProductSubmit = async (event) => {
    event.preventDefault()
    console.log(productData)

    try {
      await customFetch.patch(`/products/${productData.id}`, productData)
      toast.success('Product edited successfully')
      navigate('/dashboard/all-products')
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <Wrapper>
      <Form method='post' className='form' onSubmit={handleEditProductSubmit}>
        <h4 className='form-title'>edit product</h4>
        <div className='form-center'>
          <FormRow
            type='text'
            name='title'
            labelText='product name'
            value={productData.itemData.name}
            onChange={(e) => handleEditProduct(e, 'itemData.name')}
          />
          {productData.itemData.variations.map((variation, index) => (
            <div className='form-variation' key={variation.id}>
              <FormRow
                type='text'
                name='name'
                labelText='variation name'
                value={variation.itemVariationData.name}
                onChange={(e) =>
                  handleEditProduct(
                    e,
                    `itemData.variations[${index}].itemVariationData.name`
                  )
                }
              />
              <FormRow
                type='text'
                name='sku'
                labelText='SKU'
                value={variation.itemVariationData.sku}
                onChange={(e) =>
                  handleEditProduct(
                    e,
                    `itemData.variations[${index}].itemVariationData.sku`
                  )
                }
              />
              <FormRow
                type='text'
                name='price'
                labelText='price'
                value={variation.itemVariationData.priceMoney.amount}
                onChange={(e) =>
                  handleEditProduct(
                    e,
                    `itemData.variations[${index}].itemVariationData.priceMoney.amount`
                  )
                }
              />
              {index > 0 && (
                <div
                  className='btn remove-var-btn'
                  onClick={() => handleDeleteVariation(index)}
                >
                  X
                </div>
              )}
            </div>
          ))}

          <div className='btn add-var-btn' onClick={handleAddVariation}>
            <span>Add a Variation</span>
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

export default EditProduct
