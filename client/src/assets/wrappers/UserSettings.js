import styled from 'styled-components'

const Wrapper = styled.div`
  section {
    margin-bottom: 3rem;
  }
  h2 {
    margin-bottom: 2rem;
  }
  .setting-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    column-gap: 20px;
    margin-bottom: 1rem;
  }
  .setting-detail {
    max-width: 600px;
  }
  input[type='number'] {
    max-width: 50px;
  }
`

export default Wrapper
