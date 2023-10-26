import InventoryProduct from './InventoryProduct'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import StateBar from './StateBar'
import Wrapper from '../assets/wrappers/InventoryTable'
import { Form, useNavigate } from 'react-router-dom'
import { useAllInventoryContext } from '../pages/Inventory'
import { useDashboardContext } from '../pages/DashboardLayout'
import { ALL_LOCATIONS } from '../../../utils/constants'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { CSVLink } from 'react-csv'
import PageBtnContainer from './PageBtnContainer'

const ProductsContainer = () => {
  const {
    data: { organizedItems: products, cursor },
  } = useAllInventoryContext()
  const today = new Date()
  const dateString = `${today.getFullYear()}${today.getMonth() + 1}${
    today.getDate() + 1
  }`
  const locationHeaders = ALL_LOCATIONS.map((el) => {
    return { label: el.name, key: el.id }
  })
  const dataHeaders = [
    { label: 'Product Name', key: 'productName' },
    { label: 'Product ID', key: 'productId' },
    { label: 'Variation Name', key: 'variationName' },
    { label: 'Variation SKU', key: 'variationSku' },
    { label: 'Variation ID', key: 'variationId' },
    ...locationHeaders,
  ]

  const { user } = useDashboardContext()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [showStateBar, setShowStateBar] = useState(false)
  const [inventoryChanges, setInventoryChanges] = useState([])
  //import helpers:
  const [importInventoryModalShow, setImportInventoryModalShow] =
    useState(false)
  const [fileUploaded, setFileUploaded] = useState(false)
  const [importFile, setImportFile] = useState(null)

  const userLocations = user.locations

  const handleInventoryChange = (
    variationId,
    locationId,
    quantity,
    originalQty
  ) => {
    const newInventoryChanges = inventoryChanges.filter((el) => {
      return !(
        el.physicalCount.catalogObjectId == variationId &&
        el.physicalCount.locationId == locationId
      )
    })

    if (quantity == originalQty) {
      console.log('no change')
    } else {
      let today = new Date(Date.now())
      const inventoryChangeObj = {
        type: 'PHYSICAL_COUNT',
        physicalCount: {
          catalogObjectId: variationId,
          state: 'IN_STOCK',
          locationId: locationId,
          quantity: quantity,
          occurredAt: today.toISOString(),
        },
      }

      newInventoryChanges.push(inventoryChangeObj)
    }

    setInventoryChanges(newInventoryChanges)

    if (newInventoryChanges.length == 0) {
      setShowStateBar(false)
    } else {
      setShowStateBar(true)
    }
  }

  const discardChanges = () => {
    setEditMode(false)
    setInventoryChanges([])
    setShowStateBar(false)
  }

  const submitInventoryChanges = async (event) => {
    event.preventDefault()
    console.log(inventoryChanges)

    try {
      await customFetch.post('/inventory/update', inventoryChanges)

      navigate('/dashboard/inventory', { replace: true })
      toast.success('Inventory edited successfully')
      discardChanges()
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      return error
    }
  }

  //import inventory functions:
  const handleFileImport = (e) => {
    setImportFile(e.target.files[0])
  }

  const handleImportSubmit = async (e) => {
    e.preventDefault()

    let data = new FormData()
    data.append('type', 'inventory-recount')
    data.append('update-file', importFile)

    try {
      let response = await customFetch.post('/upload', data)
      console.log(response.data)
      toast.success('Batch update has started')
      setImportInventoryModalShow(false)
      setImportFile(null)
      navigate('/dashboard/inventory', { replace: true })
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.msg)
    }
  }

  return (
    <>
      <StateBar
        showStateBar={showStateBar}
        discardAction={discardChanges}
        submitAction={submitInventoryChanges}
      ></StateBar>
      <Wrapper>
        <div className='products'>
          <div className='inventory-actions'>
            <div className='import-export-actions'>
              <CSVLink
                data={products.flat()}
                headers={dataHeaders}
                filename={`inventory-export-${dateString}.csv`}
                className='btn'
              >
                Export Inventory
              </CSVLink>
              <button
                className='btn'
                onClick={() => setImportInventoryModalShow(true)}
              >
                Import Inventory
              </button>
            </div>
            <div className='batch-actions'>
              <Button
                onClick={() => {
                  if (!editMode) {
                    setEditMode(true)
                  } else {
                    discardChanges()
                  }
                }}
              >
                {!editMode ? 'Quick Edit' : 'Cancel'}
              </Button>
            </div>
          </div>
          {products.length === 0 ? (
            <h2>No products to display...</h2>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  {userLocations.map((location) => {
                    const loc = ALL_LOCATIONS.find((el) => el.id == location)
                    return <th key={location}>{loc.name}</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  return (
                    <InventoryProduct
                      key={product[0].productId}
                      product={product}
                      handleInventoryChange={handleInventoryChange}
                      editMode={editMode}
                    />
                  )
                })}
              </tbody>
            </Table>
          )}
        </div>
        <PageBtnContainer cursor={cursor} />
      </Wrapper>
      <ImportInventoryModal
        handleFileImport={handleFileImport}
        handleImportSubmit={handleImportSubmit}
        importFile={importFile}
        show={importInventoryModalShow}
        onHide={() => setImportInventoryModalShow(false)}
      />
    </>
  )
}

function ImportInventoryModal({
  handleImportSubmit,
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
          Edit Products Inventory by CSV
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
        <Button onClick={props.onHide}>Cancel</Button>
        <Button onClick={handleImportSubmit} disabled={importFile == null}>
          Import CSV
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ProductsContainer
