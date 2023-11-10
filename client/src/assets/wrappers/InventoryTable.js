import styled from 'styled-components'

const Wrapper = styled.article`
  table {
    width: 100%;
    background: var(--background-secondary-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-2);
  }
  .variant-row td:first-child {
    padding-left: 1.2rem;
  }

  .inventory-actions {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
    column-gap: 10px;
    justify-content: space-between;
  }
  .inventory-action-group {
    display: flex;
    -webkit-box-pack: end;
    justify-content: center;
    column-gap: 10px;
  }

  thead th {
    vertical-align: middle;
  }
  .stock-qty-header,
  .stock-qty {
    width: 1px;
    text-align: center;
    vertical-align: middle;
  }
  .stock-qty span {
    padding: 1px 12px;
  }

  .stock-qty--warning span {
    color: var(--bs-gray-dark);
    background-color: #ffe6cc;
    padding: 1px 12px;
    border-radius: 20px;
    width: 40px;
    min-width: fit-content;
    display: inline-block;
  }

  .stock-qty--out-of-stock span {
    color: #cc0023;
    background-color: #ffccd5;
    padding: 1px 12px;
    border-radius: 20px;
    width: 40px;
    min-width: fit-content;
    display: inline-block;
  }

  .stock-qty input[type='number'] {
    max-width: 65px;
  }

  /*
  header {
    padding: 1rem 1.5rem;
    border-right: 1px solid var(--grey-100);
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
  }
  input[type='checkbox'] {
    margin-left: 1rem;
  }
  label {
    display: grid;
    grid-template-columns: 1fr auto;
  }
  .main-icon {
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    background: var(--primary-500);
    border-radius: var(--border-radius);
    font-size: 1.5rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--white);
    margin-right: 2rem;
  }
  .info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    h5 {
      margin-bottom: 0.5rem;
    }
    p {
      margin: 0;
      text-transform: capitalize;
      letter-spacing: var(--letter-spacing);
      color: var(--text-secondary-color);
    }
  }
  .content {
    padding: 1rem 1.5rem;
  }
  .content-center {
    display: grid;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    grid-template-columns: 1fr;
    row-gap: 1.5rem;
    align-items: center;
    @media (min-width: 576px) {
      grid-template-columns: 1fr 1fr;
    }
  }
  .status {
    border-radius: var(--border-radius);
    text-transform: capitalize;
    letter-spacing: var(--letter-spacing);
    text-align: center;
    width: 100px;
    height: 30px;
    display: grid;
    align-items: center;
  }
  .actions {
    margin-top: 1rem;
    display: flex;
    align-items: center;
  }
  .edit-btn,
  .delete-btn {
    height: 30px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
  }
  .edit-btn {
    margin-right: 0.5rem;
  }
  */
`

export default Wrapper
