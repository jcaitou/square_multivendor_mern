import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

function ModalImportProducts({
  handleImportSubmit,
  loading,
  handleFileImport,
  importFile,
  ...props
}) {
  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>
          Import Products by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Download a <span>sample CSV template</span> to see how you should
          format your data.
        </p>
        <form>
          <input type={'file'} accept={'.csv'} onChange={handleFileImport} />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleImportSubmit}
          disabled={importFile == null || loading}
        >
          Import CSV
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalImportProducts
