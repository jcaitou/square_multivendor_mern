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
  .warning-message {
    display: flex;
    justify-content: center;
    align-items: center;
    column-gap: 20px;
  }
  .action-container {
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    column-gap: 20px;
  }
`

export default StateBarWrapper
