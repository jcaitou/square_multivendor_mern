import { toast } from 'react-toastify'
import { DiscountsContainer } from '../components'
import customFetch from '../utils/customFetch'
import { useLoaderData } from 'react-router-dom'
import { useContext, createContext } from 'react'

export const loader = async ({ request }) => {
  try {
    const { data } = await customFetch.get('/discounts')
    console.log(data)
    return {
      data,
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllDiscountsContext = createContext()

const AllDiscounts = () => {
  const { data } = useLoaderData()
  console.log(data)
  return (
    <AllDiscountsContext.Provider value={{ data }}>
      <DiscountsContainer />
    </AllDiscountsContext.Provider>
  )
}

export const useAllDiscountsContext = () => useContext(AllDiscountsContext)

export default AllDiscounts
