import Wrapper from '../assets/wrappers/Product'

import React, { Fragment } from 'react'
import { useDashboardContext } from '../pages/DashboardLayout'

const InventoryProduct = ({
  product,
  editMode,
  showHeaderRow,
  editWarningMode,
  handleInventoryChange,
  handleWarningChange,
}) => {
  return (
    <>
      {showHeaderRow && product.length > 1 && (
        <tr className='header-row'>
          <td>{product[0].productName}</td>
          <td>&nbsp;</td>
          {product[0].locationQuantities.map((el, index) => {
            return <td key={`${product[0].productId}-${index}`}>&nbsp;</td>
          })}
        </tr>
      )}

      {showHeaderRow ? (
        product.map((variation) => {
          return (
            <Fragment key={variation.variationId}>
              <tr
                className={
                  showHeaderRow && product.length > 1
                    ? 'variant-row'
                    : 'header-row'
                }
              >
                <td>
                  {showHeaderRow && product.length > 1
                    ? variation.variationName
                    : product.length > 1
                    ? `${variation.productName}: ${variation.variationName}`
                    : variation.productName}
                </td>
                <td>{variation.variationSku}</td>
                <InventoryVariation
                  variation={variation}
                  showHeaderRow={showHeaderRow}
                  editMode={editMode}
                  editWarningMode={editWarningMode}
                  handleInventoryChange={handleInventoryChange}
                  handleWarningChange={handleWarningChange}
                />
              </tr>
            </Fragment>
          )
        })
      ) : (
        <tr className='header-row'>
          <td>
            {product.productName != product.variationName
              ? `${product.productName} (${product.variationName})`
              : product.productName}
          </td>
          <td>{product.variationSku}</td>
          <InventoryVariation
            variation={product}
            showHeaderRow={showHeaderRow}
            editMode={editMode}
            editWarningMode={editWarningMode}
            handleInventoryChange={handleInventoryChange}
            handleWarningChange={handleWarningChange}
          />
        </tr>
      )}
    </>
  )
}

const InventoryVariation = ({
  variation,
  showHeaderRow,
  editMode,
  editWarningMode,
  handleInventoryChange,
  handleWarningChange,
}) => {
  return (
    <>
      {variation.locationQuantities.map((location) => {
        return (
          <td
            className={
              location.quantity <= 0
                ? 'stock-qty stock-qty--out-of-stock'
                : location.inventoryAlert != null &&
                  location.inventoryAlert >= location.quantity
                ? 'stock-qty stock-qty--warning'
                : 'stock-qty'
            }
            key={`${location.locationId}_${variation.variationId}`}
          >
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
            ) : editWarningMode ? (
              <input
                type='number'
                defaultValue={location.inventoryAlert}
                min='0'
                onChange={(e) =>
                  handleWarningChange(
                    variation.variationId,
                    location.locationId,
                    e.target.value,
                    location.inventoryAlert
                  )
                }
              ></input>
            ) : (
              <span>{location.quantity}</span>
            )}
          </td>
        )
      })}
    </>
  )
}

export default InventoryProduct
