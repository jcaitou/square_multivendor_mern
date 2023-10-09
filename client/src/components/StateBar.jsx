import StateBarWrapper from '../assets/wrappers/StateBar'
import { RiErrorWarningLine } from 'react-icons/ri'

const StateBar = ({ showStateBar, discardAction, submitAction }) => {
  if (showStateBar) {
    return (
      <StateBarWrapper>
        <div className='state-bar'>
          <div className='warning-message'>
            <span>
              <RiErrorWarningLine />
              Unsaved changes
            </span>
          </div>
          <div className='action-container'>
            <button onClick={discardAction}>Discard</button>
            <button onClick={submitAction}>Save</button>
          </div>
        </div>
      </StateBarWrapper>
    )
  }
}

export default StateBar
