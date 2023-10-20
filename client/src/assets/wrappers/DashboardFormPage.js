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
  h5 {
    margin-top: 1rem;
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

  .form-choice {
    display: grid;
    row-gap: 1rem;
    width: 100%;
  }

  .choice-group {
    width: 100%;
    justify-self: center;
    text-align: center;
  }

  .discount-option {
    margin-bottom: 1rem;
  }

  .inputs-disabled {
    color: var(--disabled-text-color);
  }

  .date-group {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 10px;
  }

  .date-group input[type='date'] {
    max-width: 180px;
  }
  .date-group input[type='date']:disabled {
    opacity: 0.7;
  }

  .date-group label {
    justify-self: flex-start;
  }

  input[type='checkbox'],
  input[type='radio'] {
    margin-right: 10px;
  }

  .discount-option input[type='number'] {
    margin-left: 7px;
    margin-right: 7px;
    max-width: 70px;
  }

  .input-label-group {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .discount-option input:not(:checked) + span {
    color: var(--disabled-text-color);
  }

  @media (min-width: 750px) {
    .form-choice {
      grid-template-columns: 1fr 1fr;
      align-items: center;
      column-gap: 1rem;
    }
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
