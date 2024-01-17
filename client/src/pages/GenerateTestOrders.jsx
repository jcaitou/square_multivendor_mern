import { SubmitBtn } from '../components'
import Wrapper from '../assets/wrappers/DashboardFormPage'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useOutletContext } from 'react-router-dom'
import { Form, redirect } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'
import { useState, Fragment } from 'react'
import { useNavigation } from 'react-router-dom'
import { set } from 'lodash'

const allProductsQuery = {
  queryKey: ['products', '', ''],
  queryFn: async () => {
    const { data } = await customFetch.get('/products')
    return data
  },
}

export const loader = (queryClient) => async () => {
  await queryClient.ensureQueryData(allProductsQuery)
  return null
}

export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData()
    // const data = Object.fromEntries(formData)
    var data = {}
    formData.forEach(function (value, key) {
      set(data, key, value)
    })

    console.log(data)

    try {
      await customFetch.post('/generate-orders/', data)
      // queryClient.invalidateQueries(['jobs'])
      toast.success('Test order successfully generated')
      return redirect('/dashboard/all-orders')
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

const GenerateTestOrders = () => {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const { user } = useOutletContext()
  const { storeLocations } = useDashboardContext()
  const [numProducts, setNumProducts] = useState(1)
  const { data } = useQuery(allProductsQuery)
  console.log(data)
  const products = data?.items
    .map((item) => {
      let itemVariations = item.itemData.variations.map((variation) => {
        let productName = item.itemData.name
        if (item.itemData.variations.length > 1) {
          productName = `${productName} (${variation.itemVariationData.name})`
        }
        return {
          name: productName,
          variationId: variation.id,
        }
      })

      return itemVariations
    })
    .flat()

  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4 className='form-title'>generate test order</h4>
        <div className='form-center'>
          <div className='form-row'>
            <label htmlFor='location' className='form-label'>
              Location
            </label>
            <select
              name='location'
              id='location'
              className='form-select'
              defaultValue={user?.locations[0]}
            >
              {user?.locations &&
                user.locations.map((location) => {
                  const locationName = storeLocations.find((el) => {
                    return el._id === location
                  }).name
                  return (
                    <option key={location} value={location}>
                      {locationName}
                    </option>
                  )
                })}
            </select>
          </div>
          {[...Array(numProducts).keys()].map((el, index) => {
            return (
              <Fragment key={'productNum' + index}>
                <div className='test-order-form-row-group'>
                  <div className='form-row'>
                    <label
                      htmlFor={`items[${index}].catalogObjectId`}
                      className='form-label'
                    >
                      Product
                    </label>
                    <select
                      name={`items[${index}].catalogObjectId`}
                      id={`items[${index}].catalogObjectId`}
                      className='form-select'
                      defaultValue={
                        products &&
                        (index < products.length
                          ? products[index]?.variationId
                          : products[0]?.variationId)
                      }
                    >
                      {products && (
                        <>
                          {products.map((item) => {
                            return (
                              <option
                                key={item.variationId}
                                value={item.variationId}
                              >
                                {item.name}
                              </option>
                            )
                          })}
                        </>
                      )}
                    </select>
                  </div>
                  <div className='form-row'>
                    <label
                      htmlFor={`items[${el}].quantity`}
                      className='form-label'
                    >
                      Qty
                    </label>
                    <input
                      type='number'
                      id={`items[${el}].quantity`}
                      name={`items[${el}].quantity`}
                      min='1'
                      max='3'
                      step='1'
                      className='form-input'
                      defaultValue='1'
                      required
                    />
                  </div>
                </div>
              </Fragment>
            )
          })}
          <div className='test-order-add-sub-buttons'>
            <button
              type='button'
              className='btn add-btn'
              onClick={() => setNumProducts(numProducts + 1)}
              disabled={numProducts > 4 || isSubmitting}
            >
              <span>Add a Product +</span>
            </button>
            <button
              type='button'
              className='btn add-btn'
              onClick={() => setNumProducts(numProducts - 1)}
              disabled={numProducts < 2 || isSubmitting}
            >
              <span>Remove a Product -</span>
            </button>
          </div>

          <div className='form-row checkbox-group'>
            <input type='checkbox' id='discount' name='discount' />
            <label htmlFor='discount' className='form-label'>
              Apply a 10% Off discount to the order
            </label>
          </div>
          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  )
}

export default GenerateTestOrders
