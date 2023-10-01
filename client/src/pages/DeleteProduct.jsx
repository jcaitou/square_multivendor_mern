import { redirect } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'

export async function action({ params, request }) {
  const confirmation = window.confirm(
    'Are you sure you want to delete this product?'
  )
  if (confirmation) {
    try {
      await customFetch.delete(`/products/${params.id}`)
      toast.success('Product deleted successfully')
    } catch (error) {
      toast.error(error?.response?.data?.msg)
    }
  }
  return redirect('/dashboard/all-products')
}
