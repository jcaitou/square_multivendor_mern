import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'
import { RiEditLine, RiDeleteBinLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import Wrapper from '../assets/wrappers/Product'
import JobInfo from './JobInfo'
import { Form } from 'react-router-dom'
import day from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
day.extend(advancedFormat)

const InventoryProduct = ({ product, inventory }) => {
  if (product.itemData.variations.length < 2) {
    return (
      <>
        {product.itemData.variations.map((variation) => {
          return (
            <>
              <tr class='header-row'>
                <td>{variation.itemVariationData.name}</td>
                <td>{variation.itemVariationData.sku}</td>
                <InventoryVariation
                  variation={variation}
                  inventory={inventory}
                />
              </tr>
            </>
          )
        })}
      </>
    )
  }

  return (
    <>
      <tr class='header-row'>
        <td>{product.itemData.name}</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      {product.itemData.variations.map((variation) => {
        return (
          <>
            <tr class='variant-row'>
              <td>{variation.itemVariationData.name}</td>
              <td>{variation.itemVariationData.sku}</td>
              <InventoryVariation variation={variation} inventory={inventory} />
            </tr>
          </>
        )
      })}
    </>
  )
}

const InventoryVariation = ({ variation, inventory }) => {
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
  console.log(variationInventory)
  const vendorLocations = ['LVBCM6VKTYDHH', 'L1NN4715DCC58']

  return (
    <>
      {variationInventory.map((inventoryInfo) => {
        return <td>{inventoryInfo.quantity}</td>
      })}
    </>
  )
}

export default InventoryProduct
