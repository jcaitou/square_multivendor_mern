import Wrapper from '../assets/wrappers/Product'

import React, { Fragment } from 'react'
import { useDashboardContext } from '../pages/DashboardLayout'

const InventoryProduct = ({ product, editMode, handleInventoryChange }) => {
  return (
    <>
      {product.length > 1 && (
        <tr className='header-row'>
          <td>{product[0].productName}</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
      )}

      {product.map((variation) => {
        return (
          <Fragment key={variation.variationId}>
            <tr className={product.length > 1 ? 'variant-row' : 'header-row'}>
              <td>
                {product.length > 1
                  ? variation.variationName
                  : variation.productName}
              </td>
              <td>{variation.variationSku}</td>
              <InventoryVariation
                variation={variation}
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

const InventoryVariation = ({ variation, editMode, handleInventoryChange }) => {
  const { user } = useDashboardContext()
  const userLocations = user.locations

  return (
    <>
      {variation.locationQuantities.map((location) => {
        return (
          <td key={`${location.locationId}_${variation.variationId}`}>
            {editMode ? (
              <input
                type='number'
                defaultValue={location.quantity}
                min='0'
                onChange={(e) =>
                  handleInventoryChange(
                    variation.variationId,
                    location.locationId,
                    e.target.value,
                    location.quantity
                  )
                }
              ></input>
            ) : (
              location.quantity
            )}
          </td>
        )
      })}
    </>
  )
}

export default InventoryProduct
