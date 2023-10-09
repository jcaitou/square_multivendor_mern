import { FormRow, FormRowSelect, StateBar } from '../components'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
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
    return redirect('/dashboard/all-products')
  }
}

const EditProduct = () => {
  const { object: product } = useLoaderData()
  const [productTitle, setProductTitle] = useState(product.itemData.name)
  function generateInitialProductVariations(product) {
    return product.itemData.variations.map((variation) => {
      return {
        id: variation.id,
        isDeleted: variation.isDeleted,
        presentAtAllLocations: variation.presentAtAllLocations,
        type: variation.type,
        updatedAt: variation.updatedAt,
        version: variation.version,
        itemVariationData: {
          ...variation.itemVariationData,
          priceMoney: {
            amount: (
              variation.itemVariationData.priceMoney.amount / 100
            ).toFixed(2),
            currency: 'CAD',
          },
        },
      }
    })
  }

  const [productVariations, setProductVariations] = useState(
    generateInitialProductVariations(product)
  )
  const [showStateBar, setShowStateBar] = useState(false)
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const discardChanges = () => {
    setProductTitle(product.itemData.name)
    setProductVariations(generateInitialProductVariations(product))
    setShowStateBar(false)
  }

  const handleEditProduct = (e, index, objectProperty) => {
    setShowStateBar(true)
    const newProductVariations = [...productVariations]
    _.set(newProductVariations[index], objectProperty, e.target.value)

    setProductVariations(newProductVariations)
  }

  const handleAddVariation = () => {
    const newProductVariations = [...productVariations]
    const newVariation = {
      type: 'ITEM_VARIATION',
      id: `#variation${Date.now()}${Math.floor(Math.random() * 10000)}`,
      itemVariationData: {
        itemId: product.id,
        name: '',
        sku: '',
        pricingType: 'FIXED_PRICING',
        priceMoney: {
          amount: 0.0,
          currency: 'CAD',
        },
        trackInventory: true,
        availableForBooking: false,
        sellable: true,
        stockable: true,
      },
    }
    newProductVariations.push(newVariation)
    setProductVariations(newProductVariations)
  }

  const handleDeleteVariation = (index) => {
    const newProductVariations = productVariations.toSpliced(index, 1)
    setProductVariations(newProductVariations)
  }

  const handleEditProductSubmit = async (event) => {
    event.preventDefault()

    const productData = { ...product }
    productData.itemData.name = productTitle
    productData.itemData.variations = JSON.parse(
      JSON.stringify(productVariations)
    )

    for (let i = 0; i < productData.itemData.variations.length; i++) {
      productData.itemData.variations[i].itemVariationData.priceMoney.amount =
        parseInt(
          Number(
            productData.itemData.variations[i].itemVariationData.priceMoney
              .amount
          ) * 100
        )
    }
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
    <>
      <StateBar
        showStateBar={showStateBar}
        discardAction={discardChanges}
        submitAction={handleEditProductSubmit}
      ></StateBar>
      <Wrapper>
        <header>
          <h4 className='form-title'>edit product</h4>
          <Form method='post' action={`../delete-product/${product.id}`}>
            <button type='submit' className='btn delete-btn'>
              <RiDeleteBinLine />
            </button>
          </Form>
        </header>
        <Form method='post' className='form' onSubmit={handleEditProductSubmit}>
          <div className='form-center'>
            <FormRow
              type='text'
              name='title'
              labelText='product name'
              value={productTitle}
              onChange={(e) => {
                setShowStateBar(true)
                setProductTitle(e.target.value)
              }}
            />
            {productVariations.map((variation, index) => (
              <div className='form-variation' key={variation.id}>
                <FormRow
                  type='text'
                  name='name'
                  labelText='variation name'
                  value={variation.itemVariationData.name}
                  onChange={(e) =>
                    handleEditProduct(e, index, 'itemVariationData.name')
                  }
                />
                <FormRow
                  type='text'
                  name='sku'
                  labelText='SKU'
                  value={variation.itemVariationData.sku}
                  onChange={(e) =>
                    handleEditProduct(e, index, 'itemVariationData.sku')
                  }
                />
                <FormRow
                  type='number'
                  name='price'
                  labelText='price'
                  value={variation.itemVariationData.priceMoney.amount}
                  onChange={(e) =>
                    handleEditProduct(
                      e,
                      index,
                      'itemVariationData.priceMoney.amount'
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
              {isSubmitting ? 'working...' : 'submit'}
            </button>
          </div>
        </Form>
      </Wrapper>
    </>
  )
}

export default EditProduct
