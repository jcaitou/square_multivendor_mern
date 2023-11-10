import styled from 'styled-components'

const Wrapper = styled.section`
  h2 {
    text-transform: none;
  }
  & > h5 {
    font-weight: 700;
    margin-bottom: 1.5rem;
  }
  .items-heading {
    display: grid;
    grid-template-columns: 3fr 1fr 2fr 2fr 2fr;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  .item-details {
    display: grid;
    grid-template-columns: 3fr 1fr 2fr 2fr 2fr;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .order-item-name {
    text-align: left;
  }
  .item-total {
    font-weight: 700;
  }
  .total-money {
    grid-column: 5;
    border-top: 1px solid black;
    font-weight: 700;
  }

  .order-item-name {
    text-align: left;
  }
  .orders {
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
