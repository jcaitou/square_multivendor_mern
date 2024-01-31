import { UncontrolledFormRow } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { Form, useNavigation, redirect } from 'react-router-dom'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'
import { useLoaderData } from 'react-router-dom'
import { singleProductQuery } from './EditProduct'
import _ from 'lodash'
import { set } from 'lodash'

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

export const action =
  (queryClient) =>
  async ({ params, request }) => {
    const formData = await request.formData()
    var data = {}
    formData.forEach(function (value, key) {
      set(data, key, value)
    })

    try {
      await customFetch.post('/products', data)
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['inventory'])
      queryClient.invalidateQueries(['stats'])
      toast.success('Product added successfully')
      return redirect('/dashboard/all-products')
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

const AddProduct = ({ queryClient }) => {
  const idToCopy = useLoaderData()

  //for the case where product is copied:
  const { data } = useQuery(singleProductQuery(idToCopy))
  const title = data?.title || null
  const variations = data?.variations || null
  const [numVariations, setNumVariations] = useState(
    variations ? variations.length : 1
  )

  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  console.log(title, variations)

  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4 className='form-title'>add product</h4>
        {title && (
          <>
            <p className='alert alert-danger' role='alert'>
              Note: The copied product is not saved until you press "Submit"!
            </p>
          </>
        )}
        <div className='form-center'>
          <UncontrolledFormRow
            type='text'
            name='title'
            labelText='product name'
            defaultValue={title}
          />
          {[...Array(numVariations).keys()].map((el, index) => {
            console.log(el)
            return (
              <div className='form-variation' key={'variationNum' + index}>
                <UncontrolledFormRow
                  type='text'
                  name={`variations[${el}].name`}
                  labelText='variation name'
                  defaultValue={
                    variations.length > el ? variations[el].name : ''
                  }
                />
                <UncontrolledFormRow
                  type='text'
                  name={`variations[${el}].sku`}
                  labelText='SKU'
                  maxLength={25}
                  defaultValue={
                    variations.length > el ? variations[el].sku : ''
                  }
                />
                <UncontrolledFormRow
                  type='number'
                  name={`variations[${el}].price`}
                  labelText='price'
                  defaultValue={
                    variations.length > el ? variations[el].price : ''
                  }
                />
                {index > 0 && (
                  <button
                    type='button'
                    onClick={() => setNumVariations(numVariations - 1)}
                  >
                    X
                  </button>
                )}
              </div>
            )
          })}

          <button
            type='button'
            className='btn add-btn'
            onClick={() => setNumVariations(numVariations + 1)}
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
