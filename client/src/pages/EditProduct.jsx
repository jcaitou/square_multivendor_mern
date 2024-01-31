import { FormRow, UncontrolledFormRow, StateBar } from '../components'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { useLoaderData } from 'react-router-dom'
import {
  Form,
  useNavigation,
  useNavigate,
  redirect,
  useSubmit,
} from 'react-router-dom'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import customFetch from '../utils/customFetch'
// import _ from 'lodash'
import { set, get, isEqual } from 'lodash'
import { useQuery } from '@tanstack/react-query'
import { useDashboardContext } from './DashboardLayout'
import bwipjs from 'bwip-js'

export const singleProductQuery = (id) => {
  return {
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await customFetch.get(`/products/${id}`)
      return data
    },
    enabled: !!id,
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

export const action =
  (queryClient) =>
  async ({ params, request }) => {
    const formData = await request.formData()
    var data = {}
    formData.forEach(function (value, key) {
      set(data, key, value)
    })

    try {
      await customFetch.patch(`/products/${params.id}`, data)
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['product', params.id])
      queryClient.invalidateQueries(['inventory'])
      toast.success('Product edited successfully')
      return redirect('/dashboard/all-products')
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

const EditProduct = ({ queryClient }) => {
  const id = useLoaderData()
  const { user } = useDashboardContext()
  const userSku = user.skuId.toString(16).padStart(4, '0')

  const { data: loaderData } = useQuery(singleProductQuery(id))
  const { title, variations } = loaderData
  const [productTitle, setProductTitle] = useState(title)
  const [numVariations, setNumVariations] = useState(variations.length)
  const [showStateBar, setShowStateBar] = useState(false)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [submitting, setSubmitting] = useState(false)

  //delete helpers:
  const [confirmDeleteModalShow, setConfirmDeleteModalShow] = useState(false)

  //edit helpers:
  const discardChanges = () => {
    const form = document.getElementById('edit-product')
    const formInputs = form.querySelectorAll('input')

    setNumVariations(variations.length)

    for (let i = 0; i < formInputs.length; i++) {
      if (i < variations.length) {
        const originalValue = get(loaderData, formInputs[i].name)
        formInputs[i].value = originalValue
      }
    }

    setShowStateBar(false)
  }

  //check if form was changed every time an input is made:
  const formChanged = () => {
    const form = document.getElementById('edit-product')
    let formData = new FormData(form)
    var currentData = {}
    formData.forEach(function (value, key) {
      set(currentData, key, value)
    })

    const changesMade = !isEqual(currentData, loaderData)

    if (changesMade) {
      setShowStateBar(true)
    } else {
      setShowStateBar(false)
    }
  }
  useEffect(() => {
    formChanged()
  })

  return (
    <>
      <StateBar
        showStateBar={showStateBar}
        loading={isSubmitting || submitting}
        discardAction={discardChanges}
        form='edit-product'
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
        <Form
          method='patch'
          className='form'
          id='edit-product'
          onChange={(e) => formChanged(e)}
        >
          <div className='form-center'>
            <UncontrolledFormRow
              type='text'
              name='title'
              labelText='product name'
              defaultValue={productTitle}
            />
            {[...Array(numVariations).keys()].map((el, index) => {
              return (
                <VariationRow
                  key={'variationNum' + index}
                  el={el}
                  index={index}
                  variation={variations[index]}
                  userSku={userSku}
                  setNumVariations={setNumVariations}
                  numVariations={numVariations}
                  formChanged={formChanged}
                />
              )
            })}

            <button
              type='button'
              className='btn add-var-btn'
              onClick={() => {
                setNumVariations(numVariations + 1)
              }}
              disabled={isSubmitting || submitting}
            >
              <span>Add a Variation</span>
            </button>
            <button
              type='submit'
              className='btn btn-block form-btn '
              disabled={isSubmitting || submitting}
            >
              {isSubmitting || submitting ? 'working...' : 'submit'}
            </button>
          </div>
        </Form>
      </Wrapper>
      <ConfirmDeleteModal
        setConfirmDeleteModalShow={setConfirmDeleteModalShow}
        isSubmitting={isSubmitting}
        submitting={submitting}
        setSubmitting={setSubmitting}
        queryClient={queryClient}
        show={confirmDeleteModalShow}
        id={id}
        onHide={() => setConfirmDeleteModalShow(false)}
      />
    </>
  )
}

function VariationRow({
  el,
  index,
  variation,
  userSku,
  setNumVariations,
  numVariations,
  formChanged,
  ...props
}) {
  const [sku, setSku] = useState(variation?.sku || '')
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
    } catch (e) {
      console.log(e)
      // `e` may be a string or Error object
    }

    const key = `barcode-${sku}`
    barcode.push(<img key={key} src={canvas.toDataURL('image/png')}></img>)
    return barcode
  }
  return (
    <div className='variation-wrapper'>
      <div className='form-variation'>
        <UncontrolledFormRow
          type='text'
          name={`variations[${el}].name`}
          labelText='variation name'
          defaultValue={variation?.name}
        />
        <UncontrolledFormRow
          type='text'
          name={`variations[${el}].sku`}
          labelText='SKU'
          maxLength={25}
          defaultValue={variation?.sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <UncontrolledFormRow
          type='number'
          name={`variations[${el}].price`}
          labelText='price'
          defaultValue={variation?.price}
        />
        <input
          type='hidden'
          id={`variations[${el}].id`}
          name={`variations[${el}].id`}
          value={variation?.id || `#variation_${el}`}
        />
        {index > 0 && (
          <button
            type='button'
            onClick={() => {
              setNumVariations(numVariations - 1)
            }}
          >
            X
          </button>
        )}
      </div>
      {sku != '' && (
        <div className='variation-barcode'>
          {renderBarcode(`${userSku}-${sku}`)}
        </div>
      )}
    </div>
  )
}

function ConfirmDeleteModal({
  setConfirmDeleteModalShow,
  isSubmitting,
  submitting,
  setSubmitting,
  queryClient,
  id,
  ...props
}) {
  const navigate = useNavigate()
  const handleDeleteProduct = async () => {
    setConfirmDeleteModalShow(false)
    try {
      setSubmitting(true)
      let response = await customFetch.delete(`/products/${id}`)
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['inventory'])
      setSubmitting(false)
      toast.success('Product deleted successfully')
      navigate('/dashboard/all-products', { replace: true })
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      setSubmitting(false)
      return error
    }
  }

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
        <Button onClick={props.onHide} disabled={isSubmitting || submitting}>
          No
        </Button>
        <Button
          onClick={handleDeleteProduct}
          disabled={isSubmitting || submitting}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default EditProduct
