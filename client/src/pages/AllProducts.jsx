import { toast } from 'react-toastify'
import { ProductsContainer, SearchContainer } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { useContext, createContext } from 'react'

export const loader = async ({ request }) => {
  try {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ])

    const { data } = await customFetch.get('/products', {
      params,
    })

    return {
      data,
      searchValues: { ...params },
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllProductsContext = createContext()

const AllProducts = () => {
  const { data, searchValues } = useLoaderData()
  return (
    <AllProductsContext.Provider value={{ data, searchValues }}>
      <SearchContainer />
      <ProductsContainer />
    </AllProductsContext.Provider>
  )
}

export const useAllProductsContext = () => useContext(AllProductsContext)

export default AllProducts
