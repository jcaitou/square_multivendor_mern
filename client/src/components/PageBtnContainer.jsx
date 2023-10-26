import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi'
import Wrapper from '../assets/wrappers/PageBtnContainer'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAllProductsContext } from '../pages/AllProducts'

const PageBtnContainer = ({ cursor }) => {
  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const currentsearchParams = new URLSearchParams(search)
  const currentCursor = currentsearchParams.get('cursor')

  const handlePageChangePrev = () => {
    navigate(-1)
  }

  const handlePageChangeNext = () => {
    const searchParams = new URLSearchParams(search)
    searchParams.set('cursor', cursor)
    navigate(`${pathname}?${searchParams.toString()}`)
  }

  return (
    <Wrapper>
      <button
        className='btn prev-btn'
        onClick={() => {
          handlePageChangePrev()
        }}
        disabled={currentCursor == null}
      >
        <HiChevronDoubleLeft />
        prev
      </button>

      <button
        className='btn next-btn'
        onClick={() => {
          handlePageChangeNext()
        }}
        disabled={!cursor}
      >
        next
        <HiChevronDoubleRight />
      </button>
    </Wrapper>
  )
}

export default PageBtnContainer
