import { toast } from 'react-toastify'
import { ProductsContainer, SearchContainer } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { useContext, createContext } from 'react'
import { useQuery } from '@tanstack/react-query'
const AllProductsContext = createContext()

const allProductsQuery = (params) => {
  const { search, cursor } = params
  return {
    queryKey: ['products', search ?? '', cursor ?? ''],
    queryFn: async () => {
      const { data } = await customFetch.get('/products', {
        params,
      })
      return data
    },
  }
}

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ])

    await queryClient.ensureQueryData(allProductsQuery(params))
    return {
      searchValues: { ...params },
    }
  }

// export const loader = async ({ request }) => {
//   try {
//     const params = Object.fromEntries([
//       ...new URL(request.url).searchParams.entries(),
//     ])

//     const { data } = await customFetch.get('/products', {
//       params,
//     })

//     return {
//       data,
//       searchValues: { ...params },
//     }
//   } catch (error) {
//     toast.error(error?.response?.data?.msg)
//     return error
//   }
// }

const AllProducts = ({ queryClient }) => {
  const { searchValues } = useLoaderData()
  const { data } = useQuery(allProductsQuery(searchValues))

  // const { data, searchValues } = useLoaderData()

  return (
    <AllProductsContext.Provider value={{ data, searchValues }}>
      <SearchContainer />
      <ProductsContainer queryClient={queryClient} />
    </AllProductsContext.Provider>
  )
}

export const useAllProductsContext = () => useContext(AllProductsContext)

export default AllProducts
