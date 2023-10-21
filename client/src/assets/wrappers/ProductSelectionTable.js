import styled from 'styled-components'

const ProductSelectionWrapper = styled.div`
  .product-selection-table {
    height: 50vh;
    overflow-x: hidden;
    overflow-y: scroll;
    transform: translate3d(0, 0, 0);
  }

  td.has-label {
    padding: unset;
  }
  .has-label label {
    display: inline-block;
    width: 100%;
    padding: 0.5rem 0.5rem;
  }
`
export default ProductSelectionWrapper
