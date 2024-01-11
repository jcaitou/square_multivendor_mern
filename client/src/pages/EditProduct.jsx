import { FormRow, StateBar } from '../components'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { useLoaderData } from 'react-router-dom'
import { Form, useNavigation, useNavigate, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import customFetch from '../utils/customFetch'
import _ from 'lodash'
import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDashboardContext } from './DashboardLayout'
import bwipjs from 'bwip-js'

const singleProductQuery = (id) => {
  return {
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/products/${id}`)
      return data
    },
  }
}

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      await queryClient.ensureQueryData(singleProductQuery(params.id))
      return params.id
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return redirect('/dashboard/all-products')
    }
  }

// export const loader = async ({ params }) => {
//   try {
//     const { data } = await customFetch.get(`/products/${params.id}`)
//     return data
//   } catch (error) {
//     toast.error(error.response.data.msg)
//     return redirect('/dashboard/all-products')
//   }
// }

const EditProduct = ({ queryClient }) => {
  // const { object: product } = useLoaderData()
  const id = useLoaderData()
  const { user } = useDashboardContext()
  const userSku = user.skuId.toString(16).padStart(4, '0')

  const {
    data: { object: product },
  } = useQuery(singleProductQuery(id))
  console.log(product)
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
          sku: variation.itemVariationData.sku.slice(5),
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
  // const navigation = useNavigation()
  // const isSubmitting = navigation.state === 'submitting'
  const [isSubmitting, setIsSubmitting] = useState(false)

  //generate barcode:
  const renderBarcode = (sku) => {
    const barcode = []

    let canvas = document.createElement('canvas')
    try {
      bwipjs.toCanvas(canvas, {
        bcid: 'code128', // Barcode type
        text: sku, // Text to encode
        scale: 3, // 3x scaling factor
        height: 10, // Bar height, in millimeters
        includetext: true, // Show human-readable text
        textxalign: 'center', // Always good to set this
      })
      console.log(canvas.toDataURL('image/png'))
    } catch (e) {
      console.log(e)
      // `e` may be a string or Error object
    }

    barcode.push(<img src={canvas.toDataURL('image/png')}></img>)
    return barcode
  }

  //delete helpers:
  const [confirmDeleteModalShow, setConfirmDeleteModalShow] = useState(false)
  const handleDeleteProduct = async () => {
    setConfirmDeleteModalShow(false)
    try {
      setIsSubmitting(true)
      let response = await customFetch.delete(`/products/${product.id}`)
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['inventory'])
      setIsSubmitting(false)
      toast.success('Product deleted successfully')
      navigate('/dashboard/all-products', { replace: true })
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
    }
  }

  //edit helpers:
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
    setShowStateBar(true)
  }

  const handleDeleteVariation = (index) => {
    const newProductVariations = productVariations.toSpliced(index, 1)
    let newVars = newProductVariations.filter((el) => {
      return el.id.includes('#variation')
    }).length
    if (
      newVars == 0 &&
      newProductVariations.length == product.itemData.variations.length
    ) {
      setShowStateBar(false)
    } else {
      setShowStateBar(true)
    }
    console.log(newVars)
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
      setIsSubmitting(true)
      console.log(productData)
      await customFetch.patch(`/products/${productData.id}`, productData)
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['product', id])
      queryClient.invalidateQueries(['inventory'])
      setIsSubmitting(false)
      toast.success('Product edited successfully')
      navigate('/dashboard/all-products', { replace: true })
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <>
      <StateBar
        showStateBar={showStateBar}
        loading={isSubmitting}
        discardAction={discardChanges}
        submitAction={handleEditProductSubmit}
      ></StateBar>
      <Wrapper>
        <header>
          <h4 className='form-title'>edit product</h4>
          <button
            type='submit'
            className='btn delete-btn'
            onClick={() => setConfirmDeleteModalShow(true)}
          >
            <RiDeleteBinLine />
          </button>
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
              <Fragment key={index}>
                <div className='variation-wrapper'>
                  <div className='form-variation'>
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
                      maxLength={25}
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
                  {/* {variation.itemVariationData.sku != '' && (
                  <Barcode
                    value={`${userSku}-${variation.itemVariationData.sku}`}
                  />
                )} */}
                  {variation.itemVariationData.sku != '' && (
                    <>
                      <div className='variation-barcode'>
                        {renderBarcode(
                          `${userSku}-${variation.itemVariationData.sku}`
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Fragment>
            ))}

            <button
              type='button'
              className='btn add-var-btn'
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
              {isSubmitting ? 'working...' : 'submit'}
            </button>
          </div>
        </Form>
      </Wrapper>
      <ConfirmDeleteModal
        handleDeleteProduct={handleDeleteProduct}
        isSubmitting={isSubmitting}
        show={confirmDeleteModalShow}
        onHide={() => setConfirmDeleteModalShow(false)}
      />
    </>
  )
}

function ConfirmDeleteModal({ handleDeleteProduct, isSubmitting, ...props }) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Delete Product
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the selected product?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} disabled={isSubmitting}>
          No
        </Button>
        <Button onClick={handleDeleteProduct} disabled={isSubmitting}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EditProduct
