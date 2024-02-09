import Wrapper from '../assets/wrappers/Dashboard'
import {
  Navbar,
  BigSidebar,
  SmallSidebar,
  Loading,
  ScrollToTop,
} from '../components'
import { useState, createContext, useContext } from 'react'
import { checkDefaultTheme } from '../utils/checkDefaultTheme'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useNavigation,
} from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export const userQuery = {
  queryKey: ['user'],
  queryFn: async () => {
    const { data } = await customFetch.get('/users/current-user')
    return data
  },
}

export const storeLocationsQuery = {
  queryKey: ['storeLocations'],
  queryFn: async () => {
    const { data } = await customFetch.get('/locations/')
    return data
  },
}

export const loader = (queryClient) => async () => {
  try {
    const userQueryPromise = queryClient.ensureQueryData(userQuery)
    const storeLocationsQueryPromise =
      queryClient.ensureQueryData(storeLocationsQuery)
    const [userData, storeLocationsData] = await Promise.all([
      userQueryPromise,
      storeLocationsQueryPromise,
    ])

    return { userData, storeLocationsData }
    //return await queryClient.ensureQueryData(userQuery)
  } catch (error) {
    return redirect('/')
  }
}

const DashboardContext = createContext()

const Dashboard = ({ isDarkThemeEnabled, queryClient }) => {
  const { user } = useQuery(userQuery)?.data
  const { locations: storeLocations } = useQuery(storeLocationsQuery)?.data
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isPageLoading = navigation.state === 'loading'
  const [showSidebar, setShowSidebar] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(checkDefaultTheme())
  const [isAuthError, setIsAuthError] = useState(false)

  const toggleDarkTheme = () => {
    const newDarkTheme = !isDarkTheme
    setIsDarkTheme(newDarkTheme)
    document.body.classList.toggle('dark-theme', newDarkTheme)
    localStorage.setItem('darkTheme', newDarkTheme)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const logoutUser = async () => {
    navigate('/')
    await customFetch.get('/auth/logout')
    queryClient.invalidateQueries()
    toast.success('Logging out...')
  }
  customFetch.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error?.response?.status === 401) {
        setIsAuthError(true)
      }
      return Promise.reject(error)
    }
  )
  useEffect(() => {
    if (!isAuthError) return
    logoutUser()
  }, [isAuthError])

  return (
    <DashboardContext.Provider
      value={{
        user,
        storeLocations,
        showSidebar,
        isDarkTheme,
        toggleDarkTheme,
        toggleSidebar,
        logoutUser,
      }}
    >
      <ScrollToTop />
      <Wrapper>
        <main className='dashboard'>
          <SmallSidebar />
          <BigSidebar />
          <div>
            <Navbar />
            <div className='dashboard-page'>
              {/* <Loading /> */}
              {isPageLoading ? <Loading /> : <Outlet context={{ user }} />}
            </div>
          </div>
        </main>
      </Wrapper>
    </DashboardContext.Provider>
  )
}

export const useDashboardContext = () => useContext(DashboardContext)

export default Dashboard
