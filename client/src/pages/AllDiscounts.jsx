import { toast } from 'react-toastify'
import { DiscountsContainer } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { useContext, createContext } from 'react'

export const loader = async ({ request }) => {
  try {
    const { data } = await customFetch.get('/discounts')
    const {
      data: { storewideDiscounts },
    } = await customFetch.get('/discounts/storewide')

    return {
      data,
      storewideDiscounts,
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllDiscountsContext = createContext()

const AllDiscounts = () => {
  const { data, storewideDiscounts } = useLoaderData()
  return (
    <AllDiscountsContext.Provider value={{ data, storewideDiscounts }}>
      <DiscountsContainer />
    </AllDiscountsContext.Provider>
  )
}

export const useAllDiscountsContext = () => useContext(AllDiscountsContext)

export default AllDiscounts
