import StateBarWrapper from '../assets/wrappers/StateBar'
import { RiErrorWarningLine } from 'react-icons/ri'
import Button from 'react-bootstrap/Button'

const StateBar = ({
  showStateBar,
  discardAction,
  submitAction,
  loading = null,
  form = null,
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
            <Button
              variant='outline-primary'
              onClick={discardAction}
              disabled={loading !== null ? loading : false}
            >
              {discardText}
            </Button>
            {form ? (
              <button
                type='submit'
                className='btn btn-block form-btn '
                form={form}
                disabled={loading !== null ? loading : false}
              >
                {loading !== null && loading ? 'working...' : 'submit'}
              </button>
            ) : (
              <Button
                variant='primary'
                onClick={submitAction}
                disabled={loading !== null ? loading : false}
              >
                {submitText}
              </Button>
            )}
          </div>
        </div>
      </StateBarWrapper>
    )
  }
}

export default StateBar
