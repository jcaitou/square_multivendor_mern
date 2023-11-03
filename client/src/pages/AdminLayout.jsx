import Wrapper from '../assets/wrappers/Dashboard'
import { Navbar, BigSidebar, SmallSidebar } from '../components'
import { useState, createContext, useContext } from 'react'
import { checkDefaultTheme } from '../utils/checkDefaultTheme'
import { Outlet, redirect, useLoaderData, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

export const loader = async () => {
  try {
    const { data } = await customFetch.get('/users/current-user')

    if (data.user.role !== 'admin') {
      return redirect('/dashboard')
    }

    console.log(data)
    return data
  } catch (error) {
    return redirect('/')
  }
}

const AdminLayout = () => {
  return <Outlet />
}

export default AdminLayout
