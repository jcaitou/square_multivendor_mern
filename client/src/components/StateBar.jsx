import StateBarWrapper from '../assets/wrappers/StateBar'
import { RiErrorWarningLine } from 'react-icons/ri'
import Button from 'react-bootstrap/Button'

const StateBar = ({
  showStateBar,
  discardAction,
  submitAction,
  warningText = 'Unsaved changes',
  discardText = 'Discard',
  submitText = 'Save',
}) => {
  if (showStateBar) {
    return (
      <StateBarWrapper>
        <div className='state-bar'>
          <div className='warning-message'>
            <RiErrorWarningLine />
            <span>{warningText}</span>
          </div>
          <div className='action-container'>
            <Button variant='outline-primary' onClick={discardAction}>
              {discardText}
            </Button>
            <Button variant='primary' onClick={submitAction}>
              {submitText}
            </Button>
          </div>
        </div>
      </StateBarWrapper>
    )
  }
}

export default StateBar
