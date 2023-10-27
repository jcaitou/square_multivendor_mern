import { squareClient } from '../utils/squareUtils.js'
import { StatusCodes } from 'http-status-codes'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import { nanoid } from 'nanoid'
import JSONBig from 'json-bigint'

export const getProductsInventory = async (req, res) => {
  const { search, cursor } = req.query

  let searchQuery = {
    limit: 100,
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: req.user.squareName,
      },
    ],
  }

  if (search) {
    searchQuery.textFilter = search
  }

  if (cursor) {
    searchQuery.cursor = cursor
  }

  const response = await squareClient.catalogApi.searchCatalogItems(searchQuery)

  if (!response) {
    throw new SquareApiError('error while obtaining products info')
  }
  if (!response.result.items) {
    //const organizedResponse = { organizedItems, cursor: response.result.cursor }
    return res.status(StatusCodes.OK).json({ organizedItems: [], cursor: '' })
  }

  const variationMapped = response.result.items
    .map((catalogItem) => {
      var variationList = catalogItem.itemData.variations.map(
        (variationList) => {
          return variationList.id
        }
      )
      return variationList
    })
    .flat()

  const inventoryResponse =
    await squareClient.inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: variationMapped,
      locationIds: req.user.locations,
    })

  if (!inventoryResponse) {
    throw new SquareApiError('error while obtaining inventory counts')
  }

  const organizedItems = response.result.items.map((catalogItem) => {
    var variationList = catalogItem.itemData.variations.map((variation) => {
      return {
        productName: catalogItem.itemData.name,
        productId: catalogItem.id,
        variationName: variation.itemVariationData.name,
        variationSku: variation.itemVariationData.sku,
        variationId: variation.id,
      }
    })
    return variationList
  })
  for (let i = 0; i < organizedItems.length; i++) {
    for (let j = 0; j < organizedItems[i].length; j++) {
      const variationInventory = inventoryResponse.result.counts.filter(
        (inventoryObj) => {
          return (
            inventoryObj.catalogObjectId == organizedItems[i][j].variationId
          )
        }
      )
      for (let k = 0; k < variationInventory.length; k++) {
        organizedItems[i][j][variationInventory[k].locationId] =
          variationInventory[k].quantity
      }
    }
  }

  const organizedResponse = { organizedItems, cursor: response.result.cursor }

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
