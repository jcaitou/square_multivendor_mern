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
import PageBtnContainer from './CursorPageBtnContainer'

const ProductsContainer = () => {
  const {
    data: { organizedItems: products },
  } = useAllInventoryContext()

  const today = new Date()
  const dateString = `${today.getFullYear()}${today.getMonth() + 1}${
    today.getDate() + 1
  }`

  let locationHeaders = null
  let dataHeaders = null
  if (products.length > 0) {
    locationHeaders = products[0][0].locationQuantities.map((location) => {
      const loc = ALL_LOCATIONS.find((el) => el.id == location.locationId)
      return { label: loc.name, key: loc.id }
    })

    dataHeaders = [
      { label: 'Product Name', key: 'productName' },
      { label: 'Product ID', key: 'productId' },
      { label: 'Variation Name', key: 'variationName' },
      { label: 'Variation SKU', key: 'variationSku' },
      { label: 'Variation ID', key: 'variationId' },
      ...locationHeaders,
    ]
  }

  const { user } = useDashboardContext()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [showStateBar, setShowStateBar] = useState(false)
  const [inventoryChanges, setInventoryChanges] = useState([])
  //import helpers:
  const [importInventoryModalShow, setImportInventoryModalShow] =
    useState(false)
  //export helpers:
  const [exportInventoryModalShow, setExportInventoryModalShow] =
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
    const params = new URLSearchParams(window.location.search)

    try {
      await customFetch.post('/inventory/update', inventoryChanges)

      navigate(`/dashboard/inventory?${params.toString()}`, { replace: true })
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
      let response = await customFetch.post('/uploads', data)
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
              {products.length > 0 && (
                <button
                  className='btn'
                  onClick={() => setExportInventoryModalShow(true)}
                >
                  Export Inventory
                </button>
              )}
              <button
                className='btn'
                onClick={() => setImportInventoryModalShow(true)}
              >
                Import Inventory
              </button>
            </div>
            {products.length > 0 && (
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
            )}
          </div>
          {products.length === 0 ? (
            <h2>No products to display...</h2>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  {products[0][0].locationQuantities.map((location) => {
                    const loc = ALL_LOCATIONS.find(
                      (el) => el.id == location.locationId
                    )
                    return <th key={location.locationId}>{loc.name}</th>
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
        {/* <PageBtnContainer cursor={cursor} /> */}
      </Wrapper>
      <ImportInventoryModal
        handleFileImport={handleFileImport}
        handleImportSubmit={handleImportSubmit}
        importFile={importFile}
        show={importInventoryModalShow}
        onHide={() => setImportInventoryModalShow(false)}
      />
      <ExportInventoryModal
        show={exportInventoryModalShow}
        products={products}
        dataHeaders={dataHeaders}
        dateString={dateString}
        onHide={() => setExportInventoryModalShow(false)}
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

function ExportInventoryModal({ products, dataHeaders, dateString, ...props }) {
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
      await customFetch.get('/exports/export-all-inventory')
      toast.success('Full inventory export will be sent to your email')
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
          Export Products Inventory by CSV
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
        <Button onClick={props.onHide}>Cancel</Button>
        {exportPage ? (
          <CSVLink
            data={products.flat().map((el) => {
              let newEl = { ...el }
              for (let i = 0; i < el.locationQuantities.length; i++) {
                newEl[el.locationQuantities[i].locationId] =
                  el.locationQuantities[i].quantity
              }
              return newEl
            })}
            headers={dataHeaders}
            filename={`inventory-export-${dateString}.csv`}
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
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ProductsContainer
