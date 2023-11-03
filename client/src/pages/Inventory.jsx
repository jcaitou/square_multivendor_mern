import React from 'react'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { useLoaderData, redirect } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useContext, createContext } from 'react'
import {
  InventoryProductsContainer,
  InventorySearchContainer,
} from '../components'

export const loader = async ({ request }) => {
  try {
    const p = new URL(request.url).searchParams
    let locations = []
    p.forEach((value, key) => {
      if (key === 'locations') {
        locations.push(value)
      }
    })
    const params = Object.fromEntries([...p.entries()])

    const { data } = await customFetch.get(
      '/inventory',
      {
        params: {
          ...params,
          locations: locations,
        },
      },
      {
        paramsSerializer: {
          indexes: null,
        },
      }
    )

    return {
      data,
      searchValues: { ...params, locations: locations },
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
