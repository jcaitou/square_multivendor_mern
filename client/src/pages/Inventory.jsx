import React from 'react'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { useLoaderData } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useContext, createContext } from 'react'
import {
  InventoryProductsContainer,
  InventorySearchContainer,
} from '../components'
//import Product from './Product'

export const loader = async ({ request }) => {
  try {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ])
    const { data } = await customFetch.get('/inventory', {
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

const AllInventoryContext = createContext()

const Inventory = () => {
  const { data, searchValues } = useLoaderData()

  return (
    <AllInventoryContext.Provider value={{ data, searchValues }}>
      <InventorySearchContainer />
      <InventoryProductsContainer />
    </AllInventoryContext.Provider>
  )
}

export const useAllInventoryContext = () => useContext(AllInventoryContext)

export default Inventory
