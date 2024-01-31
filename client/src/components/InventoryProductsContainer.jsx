import InventoryProduct from './InventoryProduct'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Wrapper from '../assets/wrappers/InventoryTable'
import { useNavigate } from 'react-router-dom'
import { useAllInventoryContext } from '../pages/Inventory'
import { useDashboardContext } from '../pages/DashboardLayout'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'
import { StateBar, ModalImportInventory, ModalExportInventory } from '.'

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
      </Wrapper>
      <ModalImportInventory
        loading={loading}
        queryClient={queryClient}
        setLoading={setLoading}
        show={importInventoryModalShow}
        setImportInventoryModalShow={setImportInventoryModalShow}
        onHide={() => setImportInventoryModalShow(false)}
      />
      <ModalExportInventory
        show={exportInventoryModalShow}
        products={products}
        dataHeaders={dataHeaders}
        dateString={dateString}
        onHide={() => setExportInventoryModalShow(false)}
      />
    </>
  )
}

export default ProductsContainer
