import styled from 'styled-components'

const Wrapper = styled.section`
  margin-top: 4rem;
  h2 {
    text-transform: none;
    margin-bottom: 1rem;
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
    margin-bottom: 4rem;
  }
  .product-actions {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    column-gap: 10px;
  }
  .grouped-actions {
    display: flex;
    column-gap: 10px;
    max-width: 500px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .grouped-actions .btn {
    height: fit-content;
  }
`
export default Wrapper
