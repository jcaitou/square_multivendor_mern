import Product from './Product'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { Form, useNavigate } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { CSVLink } from 'react-csv'
import Papa from 'papaparse'

const ProductsContainer = () => {
  const { data: products } = useAllProductsContext()
  const navigate = useNavigate()
  const [idsToDelete, setIdsToDelete] = useState([])
  const [importData, setImportData] = useState(null)

  if (products.length === 0) {
    return (
      <Wrapper>
        <h2>No products to display...</h2>
      </Wrapper>
    )
  }

  const variationsData = products
    .map((product) => {
      return product.itemData.variations.map((variation) => {
        return {
          productName: product.itemData.name,
          variationName: variation.itemVariationData.name,
          variationSku: variation.itemVariationData.sku,
          variationPrice: variation.itemVariationData.priceMoney.amount,
          productId: variation.itemVariationData.itemId.toString(),
          variationId: variation.id.toString(),
        }
      })
    })
    .flat()

  console.log(variationsData)

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

  const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: function (results) {
          setImportData(results.data)
        },
      })
    }
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()

    try {
      let response = await customFetch.post(
        '/products/batch-update',
        importData
      )
      console.log(response.data)
      //toast.success('Products deleted successfully')

      //navigate('/dashboard/all-products')
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
    }
  }

  const handleBatchDeleteProducts = async (e) => {
    e.preventDefault()

    const productData = {
      idsToDelete: idsToDelete,
    }

    try {
      let response = await customFetch.post(
        '/products/batch-delete',
        productData
      )
      toast.success('Products deleted successfully')
      setIdsToDelete([])
      navigate('/dashboard/all-products', { replace: true })
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
    }
  }

  return (
    <Wrapper>
      <div className='product-actions'>
        <CSVLink data={variationsData} className='btn'>
          Export
        </CSVLink>
        <form>
          <input type={'file'} accept={'.csv'} onChange={handleFileImport} />
          <button onClick={handleImportSubmit}>IMPORT CSV</button>
        </form>
        <button
          type='submit'
          className='btn delete-btn'
          onClick={handleBatchDeleteProducts}
          disabled={idsToDelete.length === 0}
        >
          Delete All
        </button>
      </div>
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
    </Wrapper>
  )
}

export default ProductsContainer
