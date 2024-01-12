import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { FaRegCopy } from 'react-icons/fa'

import { Link } from 'react-router-dom'
import Wrapper from '../assets/wrappers/Product'
import JobInfo from './JobInfo'
import { Form } from 'react-router-dom'
import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { HoverTooltip } from '.'
day.extend(advancedFormat)

const Product = ({
  product,
  handleItemDelSelect,
  deleteMode,
  confirmSingleDeleteProducts,
}) => {
  const date = day(product.updatedAt).format('MMM Do, YYYY')
  const CADMoney = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  })

  return (
    <Wrapper className={deleteMode && 'delete-mode'}>
      {deleteMode && (
        <input
          type='checkbox'
          id={`product_${product.id}`}
          value={product.id}
          onChange={(e) => handleItemDelSelect(e)}
        ></input>
      )}

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

        {!deleteMode && (
          <div className='content'>
            <footer className='actions'>
              <HoverTooltip title='Edit product' id='tt-edit-product'>
                <Link
                  to={`../edit-product/${product.id}`}
                  className='btn edit-btn'
                >
                  <RiEditLine />
                </Link>
              </HoverTooltip>

              <HoverTooltip title='Copy product' id='tt-copy-product'>
                <Link
                  to={`../add-product?copy=${product.id}`}
                  className='btn edit-btn'
                >
                  <FaRegCopy />
                </Link>
              </HoverTooltip>

              <HoverTooltip title='Delete product' id='tt-delete-product'>
                <button
                  type='submit'
                  className='btn delete-btn'
                  onClick={confirmSingleDeleteProducts}
                >
                  <RiDeleteBinLine />
                </button>
              </HoverTooltip>
            </footer>
          </div>
        )}
      </label>
    </Wrapper>
  )
}

export default Product
