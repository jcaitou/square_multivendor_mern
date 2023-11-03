import styled from 'styled-components'

const Wrapper = styled.section`
  margin-top: 4rem;
  h2 {
    text-transform: none;
  }
  & > h5 {
    font-weight: 700;
    margin-bottom: 1.5rem;
  }
  .products,
  .discounts,
  .file-actions {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 2rem;
  }
  .product-actions {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    column-gap: 10px;
  }
  .grouped-actions {
    display: flex;
    -webkit-box-pack: end;
    justify-content: center;
    column-gap: 10px;
  }
`
export default Wrapper
