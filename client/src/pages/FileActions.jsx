import { useLoaderData } from 'react-router-dom'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { FileAction } from '../components'
import Wrapper from '../assets/wrappers/ProductsContainer'
import PageBtnContainer from '../components/PageBtnContainer'
import { useQuery } from '@tanstack/react-query'

const allFileActionsQuery = (params) => {
  const { page } = params
  return {
    queryKey: ['fileactions', page ?? 1],
    queryFn: async () => {
      const { data } = await customFetch.get('/uploads', {
        params,
      })
      return data
    },
  }
}

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ])

    await queryClient.ensureQueryData(allFileActionsQuery(params))
    return {
      searchValues: { ...params },
    }
  }

// export const loader = async ({ request }) => {
//   try {
//     const params = Object.fromEntries([
//       ...new URL(request.url).searchParams.entries(),
//     ])

//     const { data } = await customFetch.get('/uploads')

//     return {
//       data,
//       searchValues: { ...params },
//     }
//   } catch (error) {
//     toast.error(error?.response?.data?.msg)
//     return error
//   }
// }

const FileActions = () => {
  const { searchValues } = useLoaderData()
  const {
    data: { totalItems, numOfPages, currentPage, fileActions },
  } = useQuery(allFileActionsQuery(searchValues))

  return (
    <Wrapper>
      {fileActions.length === 0 && <h2>No items to display...</h2>}
      <div className='file-actions'>
        {fileActions.map((fileAction) => {
          return <FileAction key={fileAction._id} fileAction={fileAction} />
        })}
      </div>
      {fileActions.length > 0 && (
        <PageBtnContainer numOfPages={numOfPages} currentPage={currentPage} />
      )}
    </Wrapper>
  )
}

export default FileActions
