import styled from 'styled-components'

const Wrapper = styled.article`
  background: var(--background-secondary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-2);

  &.delete-mode {
    grid-template-columns: auto 1fr auto;
  }
  header {
    padding: 1rem 1.5rem;
  }

  .discount-dates {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
  }

  input[type='checkbox'] {
    margin-left: 1rem;
  }
  label {
    display: grid;
    grid-template-columns: 1fr auto;
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
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    padding: 1rem 1.5rem;
    border-left: 1px solid var(--grey-100);
    height: 100%;
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
`

export default Wrapper
