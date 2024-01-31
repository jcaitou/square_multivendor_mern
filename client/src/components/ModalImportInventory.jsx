import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import customFetch from '../utils/customFetch'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { FILE_TYPE } from '../../../utils/constants'

function ModalImportInventory({
  loading,
  setLoading,
  setImportInventoryModalShow,
  queryClient,
  ...props
}) {
  const [importFile, setImportFile] = useState(null)
  //import inventory functions:
  const handleFileImport = (e) => {
    setImportFile(e.target.files[0])
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()

    const form = document.getElementById('inventory-import')
    let data = new FormData(form)
    data.append('update-file', importFile)

    try {
      setLoading(true)
      let response = await customFetch.post('/uploads', data)
      queryClient.invalidateQueries(['fileactions'])
      toast.success('Batch update has started')
      setLoading(false)
      setImportInventoryModalShow(false)
      setImportFile(null)
      navigate('/dashboard/inventory', { replace: true })
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      setLoading(false)
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
          Edit Products Inventory by CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Export a view of your current inventory as a starting point.</p>
        <form id='inventory-import'>
          <input
            type={'file'}
            accept={'.csv'}
            onChange={(e) => handleFileImport(e)}
          />
          <div>
            <input
              type='radio'
              id={FILE_TYPE.INVENTORY_RESTOCK}
              name='type'
              value={FILE_TYPE.INVENTORY_RESTOCK}
              defaultChecked
            />
            <label htmlFor={FILE_TYPE.INVENTORY_RESTOCK}>Restock</label>
          </div>
          <div>
            <input
              type='radio'
              id={FILE_TYPE.INVENTORY_RECOUNT}
              name='type'
              value={FILE_TYPE.INVENTORY_RECOUNT}
            />
            <label htmlFor={FILE_TYPE.INVENTORY_RECOUNT}>Recount</label>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleImportSubmit} disabled={!importFile || loading}>
          Import CSV
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalImportInventory
