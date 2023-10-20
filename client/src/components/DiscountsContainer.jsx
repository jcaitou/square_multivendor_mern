import React from 'react'
import { useAllDiscountsContext } from '../pages/AllDiscounts'
import { Link, useNavigate } from 'react-router-dom'
import Discount from './Discount'

const DiscountsContainer = () => {
  const { data: discounts } = useAllDiscountsContext()
  console.log(discounts.length)

  if (discounts.length === 0) {
    return (
      <Wrapper>
        <h2>No products to display...</h2>
      </Wrapper>
    )
  }
  return (
    <>
      <div className='product-actions'>
        <div className='grouped-actions'>
          <Link to={'../add-discount'} className='btn'>
            Add Discount
          </Link>
        </div>
      </div>
      <div className='discounts'>
        {discounts.map((discount) => {
          return <Discount key={discount.id} discount={discount} />
        })}
      </div>
    </>
  )
}

export default DiscountsContainer
