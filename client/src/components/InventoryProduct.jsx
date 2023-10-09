import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import Wrapper from '../assets/wrappers/Product'
import JobInfo from './JobInfo'
import { Form } from 'react-router-dom'
import React, { Fragment } from 'react'
import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
day.extend(advancedFormat)

const InventoryProduct = ({
  product,
  inventory,
  editMode,
  handleInventoryChange,
}) => {
  if (product.itemData.variations.length < 2) {
    return (
      <>
        {product.itemData.variations.map((variation) => {
          return (
            <Fragment key={variation.id}>
              <tr className='header-row'>
                <td>{product.itemData.name}</td>
                <td>{variation.itemVariationData.sku}</td>
                <InventoryVariation
                  variation={variation}
                  inventory={inventory}
                  editMode={editMode}
                  handleInventoryChange={handleInventoryChange}
                />
              </tr>
            </Fragment>
          )
        })}
      </>
    )
  }

  return (
    <Fragment key={`header_${product.id}`}>
      <tr className='header-row'>
        <td>{product.itemData.name}</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      {product.itemData.variations.map((variation) => {
        return (
          <Fragment key={variation.id}>
            <tr className='variant-row'>
              <td>{variation.itemVariationData.name}</td>
              <td>{variation.itemVariationData.sku}</td>
              <InventoryVariation
                variation={variation}
                inventory={inventory}
                editMode={editMode}
                handleInventoryChange={handleInventoryChange}
                key={`inventoryrow_${variation.id}`}
              />
            </tr>
          </Fragment>
        )
      })}
    </Fragment>
  )
}

const InventoryVariation = ({
  variation,
  inventory,
  editMode,
  handleInventoryChange,
}) => {
  const variationInventory = inventory.filter((el) => {
    return el.catalogObjectId == variation.id
  })

  function compare(a, b) {
    if (a.locationId < b.locationId) {
      return -1
    }
    if (a.locationId > b.locationId) {
      return 1
    }
    return 0
  }
  variationInventory.sort(compare)

  if (editMode) {
    return (
      <>
        {variationInventory.map((inventoryInfo) => {
          return (
            <td
              key={`${inventoryInfo.locationId}_${inventoryInfo.catalogObjectId}`}
            >
              <input
                type='number'
                defaultValue={inventoryInfo.quantity}
                min='0'
                onChange={(e) =>
                  handleInventoryChange(
                    inventoryInfo.catalogObjectId,
                    inventoryInfo.locationId,
                    e.target.value,
                    inventoryInfo.quantity
                  )
                }
              ></input>
            </td>
          )
        })}
      </>
    )
  } else {
    return (
      <>
        {variationInventory.map((inventoryInfo) => {
          return (
            <td
              key={`${inventoryInfo.locationId}_${inventoryInfo.catalogObjectId}`}
            >
              {inventoryInfo.quantity}
            </td>
          )
        })}
      </>
    )
  }
}

export default InventoryProduct
