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
  .revenue-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
    margin-bottom: 3rem;
  }
  .revenue-card {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 2em;
    background: var(--background-secondary-color);
    border-radius: var(--border-radius);
    row-gap: 1rem;
    text-align: center;
  }
  .revenue-card-caption {
    font-size: 0.8rem;
  }

  .revenue-money {
    text-transform: capitalize;
    letter-spacing: var(--letter-spacing);
    font-size: 2.5rem;
    font-weight: 700;
  }
  .orders-heading {
    display: grid;
    grid-template-columns: 3fr 1fr 2fr 2fr 2fr;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
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
