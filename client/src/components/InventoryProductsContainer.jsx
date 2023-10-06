import InventoryProduct from './InventoryProduct'
import Wrapper from '../assets/wrappers/InventoryTable'
import { Form, useNavigate } from 'react-router-dom'
import { useAllInventoryContext } from '../pages/Inventory'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

const ProductsContainer = () => {
  const { data } = useAllInventoryContext()
  const products = [...data.items]
  const inventory = [...data.inventory]
  console.log(inventory)
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
      <div className='products'>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Location</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              return (
                <InventoryProduct
                  key={product.id}
                  product={product}
                  inventory={inventory}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </Wrapper>
  )
}

export default ProductsContainer
