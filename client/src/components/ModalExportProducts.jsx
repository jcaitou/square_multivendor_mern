import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import customFetch from '../utils/customFetch'
import { CSVLink } from 'react-csv'
import { toast } from 'react-toastify'
import { useState } from 'react'

function ModalExportProducts({ variationsData, dateString, ...props }) {
  const [exportPage, setExportPage] = useState(true)
  const [actionSubmitted, setActionSubmitted] = useState(false)
  const handleExportTypeChange = (e) => {
    const value = e.target.value
    if (value === 'page') {
      setExportPage(true)
    } else {
      setExportPage(false)
    }
  }
  const handleExportSubmit = async (e) => {
    e.preventDefault()
    try {
      await customFetch.get('/exports/export-all-products')
      toast.success('Full product export will be sent to your email')
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
          Export Product List by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {actionSubmitted ? (
          <p>Your export has started</p>
        ) : (
          <>
            <p>Choose your export option:</p>
            <input
              type='radio'
              id='page'
              name='export-option'
              value='page'
              checked={exportPage}
              onChange={(e) => handleExportTypeChange(e)}
            />
            <label htmlFor='page'>
              Export the products in the current view
            </label>
            <input
              type='radio'
              id='full'
              name='export-option'
              value='full'
              checked={!exportPage}
              onChange={(e) => handleExportTypeChange(e)}
            />
            <label htmlFor='full'>Full export (to email)</label>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>
          {actionSubmitted ? 'Close' : 'Cancel'}
        </Button>
        {!actionSubmitted &&
          (exportPage ? (
            <CSVLink
              data={variationsData}
              filename={`products-export-${dateString}.csv`}
              onClick={() => {
                setActionSubmitted(true)
              }}
              className='btn'
            >
              Export CSV
            </CSVLink>
          ) : (
            <button className='btn' onClick={handleExportSubmit}>
              Export CSV
            </button>
          ))}
      </Modal.Footer>
    </Modal>
  )
}

export default ModalExportProducts
