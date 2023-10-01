import Product from './Product'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { Form, useNavigate } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

const ProductsContainer = () => {
  const { data: products } = useAllProductsContext()
  const navigate = useNavigate()
  const [idsToDelete, setIdsToDelete] = useState([])

  const handleItemDelSelect = (event) => {
    var newIdsToDelete = [...idsToDelete]
    if (event.target.checked) {
      newIdsToDelete.push(event.target.value)

      console.log(event.target.value)
    } else {
      newIdsToDelete = idsToDelete.filter(
        (value) => value != event.target.value
      )
    }
    setIdsToDelete(newIdsToDelete)
  }

  const handleBatchDeleteProducts = async (e) => {
    e.preventDefault()

    // const checkedInputs = e.target.querySelectorAll(
    //   'input[type=checkbox]:checked'
    // )
    // var idArray = []
    // for (let i = 0; i < checkedInputs.length; i++) {
    //   idArray.push(checkedInputs[i].value)
    // }
    // console.log(idArray)

    const productData = {
      idsToDelete: idsToDelete,
    }
    console.log(productData)

    try {
      let response = await customFetch.post(
        '/products/batch-delete',
        productData
      )
      console.log(response)
      toast.success('Products deleted successfully')
      setIdsToDelete([])
      navigate('/dashboard/all-products')
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
    }
  }

  // if (jobs.length === 0) {
  //   return (
  //     <Wrapper>
  //       <h2>No jobs to display...</h2>
  //     </Wrapper>
  //   )
  // }

  return (
    <Wrapper>
      <Form id='batchDeleteForm' onSubmit={handleBatchDeleteProducts}>
        <button
          type='submit'
          className='btn delete-btn'
          disabled={idsToDelete.length === 0}
        >
          Delete All
        </button>
        <div className='products'>
          {products.map((product) => {
            return (
              <Product
                key={product.id}
                product={product}
                handleItemDelSelect={handleItemDelSelect}
              />
            )
          })}
        </div>
      </Form>
    </Wrapper>
  )
}

export default ProductsContainer
