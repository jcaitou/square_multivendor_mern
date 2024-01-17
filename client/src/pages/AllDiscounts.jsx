import { toast } from 'react-toastify'
import { DiscountsContainer } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { useContext, createContext } from 'react'
import { useQuery } from '@tanstack/react-query'

const allDiscountsQuery = {
  queryKey: ['discounts'],
  queryFn: async () => {
    const { data: vendorDiscounts } = await customFetch.get('/discounts')
    const { data: storewideDiscounts } = await customFetch.get(
      '/discounts/storewide'
    )
    return { vendorDiscounts, storewideDiscounts }
  },
}

export const loader = (queryClient) => async () => {
  try {
    return await queryClient.ensureQueryData(allDiscountsQuery)
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllDiscountsContext = createContext()

const AllDiscounts = () => {
  const { vendorDiscounts, storewideDiscounts } =
    useQuery(allDiscountsQuery)?.data
  return (
    <AllDiscountsContext.Provider
      value={{ vendorDiscounts, storewideDiscounts }}
    >
      <DiscountsContainer />
    </AllDiscountsContext.Provider>
  )
}

export const useAllDiscountsContext = () => useContext(AllDiscountsContext)

export default AllDiscounts
