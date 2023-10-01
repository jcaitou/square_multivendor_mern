import styled from 'styled-components'

const Wrapper = styled.section`
  border-radius: var(--border-radius);
  width: 100%;
  background: var(--background-secondary-color);
  padding: 3rem 2rem 4rem;
  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .form-title {
    margin-bottom: 2rem;
  }
  .form {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
    max-width: 100%;
    width: 100%;
  }
  .form-row {
    margin-bottom: 0;
  }
  .form-center {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
  .form-variation {
    display: grid;
    row-gap: 1rem;
    width: 100%;
  }
  .form-btn {
    align-self: end;
    margin-top: 1rem;
    display: grid;
    place-items: center;
  }
  @media (min-width: 992px) {
    /* .form-center {
      grid-template-columns: 1fr 1fr;
      align-items: center;
      column-gap: 1rem;
    } */
    .form-variation {
      grid-template-columns: 1fr 1fr;
      align-items: center;
      column-gap: 1rem;
    }
  }
  @media (min-width: 1120px) {
    /* .form-center {
      grid-template-columns: 1fr 1fr 1fr;
    } */
    .form-variation {
      grid-template-columns: 1fr 1fr 1fr 30px;
    }
  }
`

export default Wrapper
