import { Outlet, redirect, useLoaderData, useNavigate } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'

export const allVendorsQuery = {
  queryKey: ['allvendors'],
  queryFn: async () => {
    const { data } = await customFetch.get('/users/all-users')
    return data
  },
}

export const loader = (queryClient) => async () => {
  try {
    const { data } = await customFetch.get('/users/current-user')

    if (data.user.role !== 'admin') {
      return redirect('/dashboard')
    }

    await queryClient.ensureQueryData(allVendorsQuery)
    return data
  } catch (error) {
    return redirect('/')
  }
}

const AdminLayout = () => {
  const { users } = useQuery(allVendorsQuery)?.data
  return <Outlet context={{ users }} />
}

export default AdminLayout
