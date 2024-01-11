import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'
import { useState } from 'react'

function ModalExportBarcode({ ...props }) {
  const [actionSubmitted, setActionSubmitted] = useState(false)

  const handleExportSubmit = async (e) => {
    e.preventDefault()
    try {
      await customFetch.get('/exports/export-barcodes')
      toast.success(
        'A zip file containing all barcodes will be sent to your email.'
      )
      setActionSubmitted(true)
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Generate Barcodes
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {actionSubmitted ? (
          <p>Barcode generation has started.</p>
        ) : (
          <>
            <p>
              A separate .png file will be generated for each unique barcode and
              the zipped file will be sent to your email. Please ensure that all
              SKUs are unique before proceeding.
            </p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>
          {actionSubmitted ? 'Close' : 'Cancel'}
        </Button>
        {!actionSubmitted && (
          <button className='btn' onClick={handleExportSubmit}>
            Start
          </button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ModalExportBarcode
