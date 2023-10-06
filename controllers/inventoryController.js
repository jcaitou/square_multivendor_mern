import { squareClient } from '../utils/squareUtils.js'
import { StatusCodes } from 'http-status-codes'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import JSONBig from 'json-bigint'

export const getProductsInventory = async (req, res) => {
  try {
    const response = await squareClient.catalogApi.searchCatalogItems({
      customAttributeFilters: [
        {
          key: 'vendor_name',
          stringFilter: req.user.squareName,
        },
      ],
    })

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

    try {
      const inventoryResponse =
        await squareClient.inventoryApi.batchRetrieveInventoryCounts({
          catalogObjectIds: variationMapped,
          locationIds: ['L1NN4715DCC58', 'LVBCM6VKTYDHH'],
        })

      const returnResponse = {
        items: response.result.items,
        inventory: inventoryResponse.result.counts,
      }
      // console.log(inventoryResponse.result.counts)
      // const returnReponse = response.result.items

      // for (let i = 0; i < returnReponse.length; i++) {
      //   console.log(returnReponse[i].itemData.variations)
      //   for (let j = 0; j < returnReponse[i].itemData.variations.length; j++) {
      //     console.log(returnReponse[i].itemData.variations[j].id)
      //     var variationInventory = inventoryResponse.result.counts.filter(
      //       (el) => {
      //         return (
      //           el.catalogObjectId == returnReponse[i].itemData.variations[j].id
      //         )
      //       }
      //     )
      //     returnReponse[i].itemData.variations[j].inventoryInfo =
      //       variationInventory
      //     console.log(variationInventory)
      //   }
      // }

      // console.log(returnReponse)

      const parsedResponse = JSONBig.parse(JSONBig.stringify(returnResponse))

      res.status(StatusCodes.OK).json(parsedResponse)
    } catch (error) {
      throw new SquareApiError('error while obtaining inventory counts')
    }
  } catch (error) {
    throw new SquareApiError('error while calling the Square API')
  }
}
