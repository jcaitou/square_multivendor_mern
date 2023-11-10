import styled from 'styled-components'

const Wrapper = styled.article`
  background: var(--background-secondary-color);
  border-radius: var(--border-radius);
  display: grid;
  grid-template-rows: auto auto;
  box-shadow: var(--shadow-2);
  padding: 1rem 1.5rem;

  .order-summary-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 7px;
  }
  .order-details {
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
`

export default Wrapper
