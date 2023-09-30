import { toast } from 'react-toastify'
import { ProductsContainer, SearchContainer } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { useContext, createContext } from 'react'

export const loader = async ({ request }) => {
  try {
    const { data } = await customFetch.get('/products')
    console.log(data)
    return {
      data,
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllProductsContext = createContext()

const AllProducts = () => {
  const { data } = useLoaderData()
  return (
    <AllProductsContext.Provider value={{ data }}>
      <SearchContainer />
      <ProductsContainer />
    </AllProductsContext.Provider>
  )
}

export const useAllProductsContext = () => useContext(AllProductsContext)

export default AllProducts
