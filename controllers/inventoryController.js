import { squareClient } from '../utils/squareUtils.js'
import { StatusCodes } from 'http-status-codes'
import { SquareApiError } from '../errors/customError.js'
import { nanoid } from 'nanoid'
import JSONBig from 'json-bigint'

export const getProductsInventory = async (req, res) => {
  const { search, sort, locations: locationsQuery } = req.query
  //sort can be a-z, z-a, quantityAsc, quantityDesc

  let locations
  if (!locationsQuery) {
    locations = req.user.locations
  } else if (Array.isArray(locationsQuery)) {
    locations = locationsQuery
  } else {
    locations = [locationsQuery]
  }

  let searchQuery = {
    limit: 100,
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: req.user.name,
      },
    ],
  }

  if (search) {
    searchQuery.textFilter = search
  }

  let response = await squareClient.catalogApi.searchCatalogItems(searchQuery)

  if (!response) {
    throw new SquareApiError('error while obtaining products info')
  }
  if (!response.result.items) {
    return res.status(StatusCodes.OK).json({ organizedItems: [], cursor: '' })
  }

  let productResults = response.result.items
  let cursor = response.result.cursor || ''
  while (cursor != '') {
    searchQuery.cursor = cursor
    response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    if (!response) {
      throw new SquareApiError('error while obtaining products info')
    }
    cursor = response.result.cursor || ''
    productResults = productResults.concat(response.result.items)
  }

  const variationMapped = productResults
    .map((catalogItem) => {
      var variationList = catalogItem.itemData.variations.map(
        (variationList) => {
          return variationList.id
        }
      )
      return variationList
    })
    .flat()

  let inventoryQuery = {
    catalogObjectIds: variationMapped,
    locationIds: locations,
    // limit: 44,
  }
  let inventoryResponse =
    await squareClient.inventoryApi.batchRetrieveInventoryCounts(inventoryQuery)

  if (!inventoryResponse) {
    throw new SquareApiError('error while obtaining inventory counts')
  }

  let inventoryResults = inventoryResponse.result.counts
  let inventoryCursor = inventoryResponse.result.cursor || ''

  while (inventoryCursor != '') {
    inventoryQuery.cursor = inventoryCursor
    inventoryResponse =
      await squareClient.inventoryApi.batchRetrieveInventoryCounts(
        inventoryQuery
      )

    if (!inventoryResponse) {
      throw new SquareApiError('error while obtaining inventory counts')
    }
    inventoryCursor = inventoryResponse.result.cursor || ''
    inventoryResults = inventoryResults.concat(inventoryResponse.result.counts)
  }

  const organizedItems = productResults.map((catalogItem) => {
    var variationList = catalogItem.itemData.variations.map((variation) => {
      let inventoryAlertCounts = []
      for (let i = 0; i < locations.length; i++) {
        const index = variation.itemVariationData.locationOverrides.findIndex(
          (el) => {
            return el.locationId == locations[i]
          }
        )
        inventoryAlertCounts.push({
          locationId:
            variation.itemVariationData.locationOverrides[index].locationId,
          inventoryAlert:
            variation.itemVariationData.locationOverrides[index]
              ?.inventoryAlertThreshold || null,
        })
      }
      // const inventoryAlertCounts =
      //   variation.itemVariationData.locationOverrides.map((location) => {
      //     return {
      //       locationId: location.locationId,
      //       inventoryAlert: location?.inventoryAlertThreshold || null,
      //     }
      //   })
      return {
        productName: catalogItem.itemData.name,
        productId: catalogItem.id,
        variationName: variation.itemVariationData.name,
        variationSku: variation.itemVariationData.sku,
        variationId: variation.id,
        locationQuantities: inventoryAlertCounts,
      }
    })
    return variationList
  })
  for (let i = 0; i < organizedItems.length; i++) {
    for (let j = 0; j < organizedItems[i].length; j++) {
      const variationInventory = inventoryResults.filter((inventoryObj) => {
        return inventoryObj.catalogObjectId == organizedItems[i][j].variationId
      })

      variationInventory.sort((a, b) => {
        const nameA = a.locationId.toUpperCase() // ignore upper and lowercase
        const nameB = b.locationId.toUpperCase() // ignore upper and lowercase
        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }

        return 0
      })

      for (let k = 0; k < variationInventory.length; k++) {
        // organizedItems[i][j][variationInventory[k].locationId] =
        //   variationInventory[k].quantity
        const index = organizedItems[i][j].locationQuantities.findIndex(
          (el) => {
            return el.locationId == variationInventory[k].locationId
          }
        )
        organizedItems[i][j].locationQuantities[index].quantity =
          variationInventory[k].quantity

        // organizedItems[i][j].locationQuantities.push({
        //   locationId: variationInventory[k].locationId,
        //   quantity: variationInventory[k].quantity,
        // })
      }
    }
  }

  let organizedItemsOriginal = organizedItems.flat()
  let responseObj
  if (sort === 'z-a') {
    responseObj = organizedItems.reverse()
  } else if (sort === 'quantityAsc' || sort === 'quantityDesc') {
    let returnValue = 1
    if (sort === 'quantityDesc') {
      returnValue = -1
    }
    responseObj = organizedItems.flat()
    responseObj.sort((a, b) => {
      let countA = 0
      let countB = 0
      for (let j = 0; j < a.locationQuantities.length; j++) {
        countA = countA + Number(a.locationQuantities[j].quantity)
      }
      for (let j = 0; j < b.locationQuantities.length; j++) {
        countB = countB + Number(b.locationQuantities[j].quantity)
      }
      return returnValue * (countA - countB)
    })
  } else {
    responseObj = organizedItems
  }

  const organizedResponse = {
    organizedItems: responseObj,
    // organizedItemsOriginal: responseObj,
  }

  const parsedResponse = JSONBig.parse(JSONBig.stringify(organizedResponse))

  res.status(StatusCodes.OK).json(parsedResponse)
}

export const updateProductsInventory = async (req, res) => {
  try {
    const response = await squareClient.inventoryApi.batchChangeInventory({
      idempotencyKey: nanoid(),
      changes: req.body,
    })
    const parsedResponse = JSONBig.parse(JSONBig.stringify(response))
    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }
}

export const updateInventoryWarning = async (req, res) => {
  const key = nanoid()
  const updateList = req.body

  productLoop: for (let i = 0; i < updateList.length; i++) {
    const productResponse = await squareClient.catalogApi.retrieveCatalogObject(
      updateList[i].variationId,
      false
    )
    if (!productResponse) {
      throw new SquareApiError('Square API error trying to get product info')
    }
    const productUpdate = productResponse.result.object

    const itemVendor =
      productResponse.result.object.customAttributeValues['vendor_name']
        .stringValue

    if (itemVendor != req.user.name) {
      continue productLoop
    }

    const locationOverrides = productUpdate.itemVariationData.locationOverrides

    const index = locationOverrides.findIndex((el) => {
      return el.locationId == updateList[i].locationId
    })
    if (index < 0) {
      locationOverrides.push({
        locationId: updateList[i].locationId,
        trackInventory: true,
        inventoryAlertType: 'LOW_QUANTITY',
        inventoryAlertThreshold: updateList[i].warning,
      })
    } else {
      locationOverrides[index].inventoryAlertType = 'LOW_QUANTITY'
      locationOverrides[index].inventoryAlertThreshold = updateList[i].warning
    }

    productUpdate.itemVariationData.locationOverrides = locationOverrides

    const response = await squareClient.catalogApi.upsertCatalogObject({
      idempotencyKey: key,
      object: productUpdate,
    })

    if (!response) {
      throw new SquareApiError('Square API error trying to update product')
    }
  }
  return res.status(StatusCodes.OK).json(req.body)
}
