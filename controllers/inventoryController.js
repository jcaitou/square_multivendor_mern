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
  const response = await squareClient.catalogApi.searchCatalogItems({
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: req.user.squareName,
      },
    ],
  })

  if (!response) {
    throw new SquareApiError('error while obtaining products info')
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

  // const returnResponse = {
  //   items: response.result.items,
  //   inventory: inventoryResponse.result.counts,
  // }

  const organizedResponse = response.result.items.map((catalogItem) => {
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
  for (let i = 0; i < organizedResponse.length; i++) {
    for (let j = 0; j < organizedResponse[i].length; j++) {
      const variationInventory = inventoryResponse.result.counts.filter(
        (inventoryObj) => {
          return (
            inventoryObj.catalogObjectId == organizedResponse[i][j].variationId
          )
        }
      )
      for (let k = 0; k < variationInventory.length; k++) {
        organizedResponse[i][j][variationInventory[k].locationId] =
          variationInventory[k].quantity
      }
    }
  }

  const parsedResponse = JSONBig.parse(JSONBig.stringify(organizedResponse))

  res.status(StatusCodes.OK).json(parsedResponse)
}

export const updateProductsInventory = async (req, res) => {
  console.log(req.body)

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
