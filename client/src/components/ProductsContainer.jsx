import Product from './Product'
import Wrapper from '../assets/wrappers/ProductsContainer'
import { useAllProductsContext } from '../pages/AllProducts'

const ProductsContainer = () => {
  const { data: products } = useAllProductsContext()

  // if (jobs.length === 0) {
  //   return (
  //     <Wrapper>
  //       <h2>No jobs to display...</h2>
  //     </Wrapper>
  //   )
  // }

  return (
    <Wrapper>
      <div className='products'>
        {products.map((product) => {
          return <Product key={product.id} {...product} />
        })}
      </div>
    </Wrapper>
  )
}

export default ProductsContainer
