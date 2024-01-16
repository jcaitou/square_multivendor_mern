import React from 'react'
import { useLoaderData, redirect } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useContext, createContext } from 'react'
import {
  InventoryProductsContainer,
  InventorySearchContainer,
} from '../components'
import { useQuery } from '@tanstack/react-query'
import { useDashboardContext } from './DashboardLayout'
import { userQuery } from './DashboardLayout'

const allInventoryQuery = (searchValues, user) => {
  const { search, sort, locations } = searchValues
  const locationsQueryKey =
    !locations || locations.length == 0 ? user.locations : locations
  return {
    queryKey: ['inventory', search ?? '', sort ?? 'a-z', locationsQueryKey],
    queryFn: async () => {
      const { data } = await customFetch.get(
        '/inventory',
        {
          params: searchValues,
        },
        {
          paramsSerializer: {
            indexes: null,
          },
        }
      )
      return data
    },
  }
}

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const p = new URL(request.url).searchParams
    let locations = []
    p.forEach((value, key) => {
      if (key === 'locations') {
        locations.push(value)
      }
    })
    const params = Object.fromEntries([...p.entries()])
    params.locations = locations

    const { user } = await queryClient.ensureQueryData(userQuery)

    await queryClient.ensureQueryData(allInventoryQuery(params, user))
    return {
      searchValues: { ...params, locations: locations },
    }
  }

const AllInventoryContext = createContext()

const Inventory = ({ queryClient }) => {
  const { searchValues } = useLoaderData()
  const { user } = useDashboardContext()
  const { data } = useQuery(allInventoryQuery(searchValues, user))

  return (
    <AllInventoryContext.Provider value={{ data, searchValues }}>
      <InventorySearchContainer />
      <InventoryProductsContainer queryClient={queryClient} />
    </AllInventoryContext.Provider>
  )
}

export const useAllInventoryContext = () => useContext(AllInventoryContext)

export default Inventory
