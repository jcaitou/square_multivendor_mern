import { useLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

export const loader = async ({ request }) => {
  try {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ])

    const { data } = await customFetch.get('/orders')

    console.log(data)

    return {
      data,
      searchValues: { ...params },
    }
  } catch (error) {
    toast.error(error?.response?.data?.msg)
    return error
  }
}

const AllOrders = () => {
  return <div>AllOrders</div>
}

export default AllOrders
