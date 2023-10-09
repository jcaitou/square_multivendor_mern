import InventoryProduct from './InventoryProduct'
import StateBar from './StateBar'
import Wrapper from '../assets/wrappers/InventoryTable'
import { Form, useNavigate } from 'react-router-dom'
import { useAllInventoryContext } from '../pages/Inventory'
import { useDashboardContext } from '../pages/DashboardLayout'
import { ALL_LOCATIONS } from '../../../utils/constants'
import { useState } from 'react'
import { toast } from 'react-toastify'
import customFetch from '../utils/customFetch'

const ProductsContainer = () => {
  const { data } = useAllInventoryContext()
  const { user } = useDashboardContext() //need this for the user's active locations later

  const products = [...data.items]
  const inventory = [...data.inventory]
  const [editMode, setEditMode] = useState(false)
  const [showStateBar, setShowStateBar] = useState(false)
  const [inventoryChanges, setInventoryChanges] = useState([])
  const navigate = useNavigate()

  function compare(a, b) {
    if (a.locationId < b.locationId) {
      return -1
    }
    if (a.locationId > b.locationId) {
      return 1
    }
    return 0
  }
  const userLocations = user.locations.sort(compare)

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

  if (products.length === 0) {
    return (
      <Wrapper>
        <h2>No products to display...</h2>
      </Wrapper>
    )
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
          <button
            onClick={() => {
              if (!editMode) {
                setEditMode(true)
              } else {
                discardChanges()
              }
            }}
          >
            {!editMode ? 'Quick Edit' : 'Discard Changes'}
          </button>
          <table>
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
                    key={product.id}
                    product={product}
                    inventory={inventory}
                    handleInventoryChange={handleInventoryChange}
                    editMode={editMode}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </Wrapper>
    </>
  )
}

export default ProductsContainer
