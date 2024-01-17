import InventoryProduct from './InventoryProduct'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import StateBar from './StateBar'
import Wrapper from '../assets/wrappers/InventoryTable'
import { Form, useNavigate } from 'react-router-dom'
import { useAllInventoryContext } from '../pages/Inventory'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { CSVLink } from 'react-csv'
import PageBtnContainer from './CursorPageBtnContainer'

const ProductsContainer = ({ queryClient }) => {
  const {
    data: { organizedItems: products },
    searchValues,
  } = useAllInventoryContext()
  const sort = searchValues.sort
  const { user, storeLocations } = useDashboardContext()

  let locations
  if (searchValues.locations.length > 0) {
    locations = searchValues.locations
  } else if (products && products.length == 0) {
    locations = user.locations
  } else if (products[0]?.locationQuantities) {
    locations = products[0]?.locationQuantities.map((el) => {
      return el.locationId
    })
  } else if (products[0][0]?.locationQuantities) {
    locations = products[0][0]?.locationQuantities.map((el) => {
      return el.locationId
    })
  }

  const showHeaderRow = sort !== 'quantityAsc' && sort !== 'quantityDesc'
  const today = new Date()
  const dateString = `${today.getFullYear()}${today.getMonth() + 1}${
    today.getDate() + 1
  }`

  let locationHeaders = null
  let dataHeaders = null
  if (products.length > 0) {
    locationHeaders = locations.map((location) => {
      const loc = storeLocations.find((el) => el._id == location)
      return { label: loc.name, key: loc._id }
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

  const navigate = useNavigate()

  //loading helper:
  const [loading, setLoading] = useState(false)
  //edit inventory helpers:
  const [editMode, setEditMode] = useState(false)
  const [showStateBar, setShowStateBar] = useState(false)
  const [inventoryChanges, setInventoryChanges] = useState([])
  //edit warning helpers:
  const [editWarningMode, setEditWarningMode] = useState(false)
  const [showWarningStateBar, setShowWarningStateBar] = useState(false)
  const [warningChanges, setWarningChanges] = useState([])
  //import helpers:
  const [importInventoryModalShow, setImportInventoryModalShow] =
    useState(false)
  //export helpers:
  const [exportInventoryModalShow, setExportInventoryModalShow] =
    useState(false)
  const [importFile, setImportFile] = useState(null)

  //handle inventory change:
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
      setLoading(true)
      await customFetch.post('/inventory/update', inventoryChanges)
      queryClient.invalidateQueries(['inventory'])
      setLoading(false)
      navigate(`/dashboard/inventory?${params.toString()}`, { replace: true })
      toast.success('Inventory edited successfully')
      discardChanges()
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      setLoading(false)
      return error
    }
  }

  //handle warning change:
  const handleWarningChange = (
    variationId,
    locationId,
    warning,
    originalWarning
  ) => {
    const newWarningChanges = warningChanges.filter((el) => {
      return !(el.variationId == variationId && el.locationId == locationId)
    })

    if (warning == originalWarning) {
      console.log('no change')
    } else {
      newWarningChanges.push({
        variationId,
        locationId,
        warning,
      })
    }

    setWarningChanges(newWarningChanges)

    if (newWarningChanges.length == 0) {
      setShowWarningStateBar(false)
    } else {
      setShowWarningStateBar(true)
    }
  }

  const discardWarningChanges = () => {
    setEditWarningMode(false)
    setWarningChanges([])
    setShowWarningStateBar(false)
  }

  const submitWarningChanges = async (event) => {
    event.preventDefault()
    const params = new URLSearchParams(window.location.search)

    try {
      setLoading(true)
      await customFetch.post('/inventory/update-warning', warningChanges)
      queryClient.invalidateQueries(['inventory'])
      setLoading(false)
      navigate(`/dashboard/inventory?${params.toString()}`, { replace: true })
      toast.success('Warning levels edited successfully')
      discardWarningChanges()
    } catch (error) {
      toast.error(error?.response?.data?.msg)
      setLoading(false)
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
    <>
      <StateBar
        showStateBar={showWarningStateBar}
        discardAction={discardWarningChanges}
        submitAction={submitWarningChanges}
        loading={loading}
      ></StateBar>
      <StateBar
        showStateBar={showStateBar}
        discardAction={discardChanges}
        submitAction={submitInventoryChanges}
        loading={loading}
      ></StateBar>
      <Wrapper>
        <div className='products'>
          <div className='inventory-actions'>
            <div className='inventory-action-group'>
              {products.length > 0 && (
                <button
                  className='btn'
                  onClick={() => setExportInventoryModalShow(true)}
                >
                  Export Inventory
                </button>
              )}
              {user.active && (
                <>
                  <button
                    className='btn'
                    onClick={() => setImportInventoryModalShow(true)}
                  >
                    Import Inventory
                  </button>
                </>
              )}
            </div>
            {products.length > 0 && (
              <div className='inventory-action-group'>
                <button
                  className='btn'
                  disabled={editMode}
                  onClick={() => {
                    if (!editWarningMode) {
                      setEditWarningMode(true)
                    } else {
                      discardWarningChanges()
                    }
                  }}
                >
                  {!editWarningMode ? 'Change Warning Levels' : 'Cancel'}
                </button>
                <Button
                  disabled={editWarningMode}
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
                  {locations.map((location) => {
                    const loc = storeLocations.find((el) => el._id == location)
                    return (
                      <th
                        className='stock-qty-header'
                        key={`header-${location}`}
                      >
                        {loc.name}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  return (
                    <InventoryProduct
                      key={
                        showHeaderRow
                          ? product[0].productId
                          : `row-${product.productId}-${product.variationId}`
                      }
                      product={product}
                      showHeaderRow={showHeaderRow}
                      handleInventoryChange={handleInventoryChange}
                      editMode={editMode}
                      editWarningMode={editWarningMode}
                      handleWarningChange={handleWarningChange}
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
        loading={loading}
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
        <Button onClick={props.onHide}>
          {actionSubmitted ? 'Close' : 'Cancel'}
        </Button>
        {!actionSubmitted &&
          (exportPage ? (
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
          ))}
      </Modal.Footer>
    </Modal>
  )
}

export default ProductsContainer
