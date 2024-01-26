import styled from 'styled-components'

const Wrapper = styled.section`
  .contract-field {
    display: flex;
  }
  .contract-field label {
    font-size: 1.2em;
    padding-right: 10px;
  }
  .contract {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
  .contract-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`
export default Wrapper
