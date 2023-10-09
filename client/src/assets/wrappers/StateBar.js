import styled from 'styled-components'

const StateBarWrapper = styled.nav`
  background: var(--background-secondary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-2);
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0%;
  width: 100vw;
  height: var(--nav-height);

  .state-bar {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    height: 100%;
  }
`

export default StateBarWrapper
