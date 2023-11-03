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
      return {
        productName: catalogItem.itemData.name,
        productId: catalogItem.id,
        variationName: variation.itemVariationData.name,
        variationSku: variation.itemVariationData.sku,
        variationId: variation.id,
        locationQuantities: [],
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
        organizedItems[i][j].locationQuantities.push({
          locationId: variationInventory[k].locationId,
          quantity: variationInventory[k].quantity,
        })
      }
    }
  }

  let organizedItemsOriginal = organizedItems
  if (sort === 'z-a') {
    organizedItems.reverse()
  } else if (sort === 'quantityAsc' || sort === 'quantityDesc') {
    let returnValue = 1
    if (sort === 'quantityDesc') {
      returnValue = -1
    }
    organizedItems.sort((a, b) => {
      let countA = 0
      let countB = 0
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a[i].locationQuantities.length; j++) {
          countA = countA + Number(a[i].locationQuantities[j].quantity)
        }
      }
      for (let i = 0; i < b.length; i++) {
        for (let j = 0; j < b[i].locationQuantities.length; j++) {
          countB = countB + Number(b[i].locationQuantities[j].quantity)
        }
      }
      return returnValue * (countA - countB)
    })
  }

  const organizedResponse = {
    organizedItems,
    organizedItemsOriginal,
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
