import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import Wrapper from '../assets/wrappers/Product'
import JobInfo from './JobInfo'
import { Form } from 'react-router-dom'
import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
day.extend(advancedFormat)

const Product = ({ product, handleItemDelSelect }) => {
  const date = day(product.updatedAt).format('MMM Do, YYYY')
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })

  const handleProductDelete = (e) => {
    return null
  }

  return (
    <Wrapper>
      <input
        type='checkbox'
        id={`product_${product.id}`}
        value={product.id}
        onChange={(e) => handleItemDelSelect(e)}
      ></input>
      <label htmlFor={`product_${product.id}`}>
        <header>
          <div className='main-icon'>{product.itemData.name.charAt(0)}</div>
          <div className='info'>
            <div className='product-title'>
              <h5>{product.itemData.name}</h5>
              <p>
                {product.itemData.variations.length > 1 &&
                  `${product.itemData.variations.length} variations`}
              </p>
            </div>
            <div className='product-price'>
              <p>
                {CADMoney.format(
                  product.itemData.variations[0].itemVariationData.priceMoney
                    .amount / 100
                )}
              </p>
            </div>
          </div>
        </header>
        <div className='content'>
          <footer className='actions'>
            <Link to={`../edit-product/${product.id}`} className='btn edit-btn'>
              <RiEditLine />
            </Link>

            <button
              type='submit'
              className='btn delete-btn'
              onClick={() => handleProductDelete()}
            >
              <RiDeleteBinLine />
            </button>
          </footer>
        </div>
      </label>
    </Wrapper>
  )
}

export default Product
