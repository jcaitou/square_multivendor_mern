import React from 'react'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { useLoaderData, redirect } from 'react-router-dom'
import customFetch from '../utils/customFetch'
import { useContext, createContext } from 'react'
import {
  InventoryProductsContainer,
  InventorySearchContainer,
} from '../components'
import { useQuery } from '@tanstack/react-query'
import { ALL_LOCATIONS } from '../../../utils/constants'

const allLocationsArray = ALL_LOCATIONS.map((el) => el.id)

const allInventoryQuery = (searchValues) => {
  const { search, sort, locations } = searchValues
  const locationsQueryKey =
    !locations || locations.length == 0 ? allLocationsArray : locations
  return {
    queryKey: ['inventory', search ?? '', sort ?? 'a-z', locationsQueryKey],
    queryFn: async () => {
      const { data } = await customFetch.get(
        '/inventory',
        // {
        //   params: {
        //     ...params,
        //     locations: locations,
        //   },
        // },
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

    await queryClient.ensureQueryData(allInventoryQuery(params))
    return {
      searchValues: { ...params, locations: locations },
    }
  }

// export const loader = async ({ request }) => {
//   try {
//     const p = new URL(request.url).searchParams
//     let locations = []
//     p.forEach((value, key) => {
//       if (key === 'locations') {
//         locations.push(value)
//       }
//     })
//     const params = Object.fromEntries([...p.entries()])

//     const { data } = await customFetch.get(
//       '/inventory',
//       {
//         params: {
//           ...params,
//           locations: locations,
//         },
//       },
//       {
//         paramsSerializer: {
//           indexes: null,
//         },
//       }
//     )

//     return {
//       data,
//       searchValues: { ...params, locations: locations },
//     }
//   } catch (error) {
//     toast.error(error?.response?.data?.msg)
//     return error
//   }
// }

const AllInventoryContext = createContext()

const Inventory = ({ queryClient }) => {
  const { searchValues } = useLoaderData()
  const { data } = useQuery(allInventoryQuery(searchValues))
  // const { data, searchValues } = useLoaderData()

  return (
    <AllInventoryContext.Provider value={{ data, searchValues }}>
      <InventorySearchContainer />
      <InventoryProductsContainer queryClient={queryClient} />
    </AllInventoryContext.Provider>
  )
}

export const useAllInventoryContext = () => useContext(AllInventoryContext)

export default Inventory
