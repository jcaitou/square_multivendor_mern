import { squareClient } from '../utils/squareUtils.js'
import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import JSONBig from 'json-bigint'

const vendorLocations = ['LVBCM6VKTYDHH', 'L1NN4715DCC58']

export const getAllProducts = async (req, res) => {
  const { search, cursor } = req.query

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

  if (cursor) {
    searchQuery.cursor = cursor
  }

  try {
    const response = await squareClient.catalogApi.searchCatalogItems(
      searchQuery
    )

    let parsedResponse

    if (response.result) {
      parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))
    } else {
      parsedResponse = []
    }
    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    console.log(error)
    throw new SquareApiError('error while calling the Square API')
  }
}

export const upsertProduct = async (req, res) => {
  const key = nanoid()
  const productData = req.body
  const today = new Date(Date.now())

  // /* refactor this into product input validation */
  // if (productData.variations.length < 1) {
  //   console.log('at least one variation is required')
  // }
  // /* refactor above */

  // var newProductVariations = productData.variations.map((variation, index) => ({
  //   type: 'ITEM_VARIATION',
  //   id: `#variation${index}`,
  //   itemVariationData: {
  //     name: variation.name || productData.name,
  //     sku: variation.sku || '',
  //     pricingType: 'FIXED_PRICING',
  //     priceMoney: {
  //       amount: variation.price || 0,
  //       currency: 'CAD',
  //     },
  //     trackInventory: true,
  //     availableForBooking: false,
  //     stockable: true,
  //   },
  // }))

  // var newObject = {
  //   type: 'ITEM',
  //   id: '#newitem',
  //   customAttributeValues: {
  //     vendor_name: {
  //       stringValue: req.user.name,
  //     },
  //   },
  //   itemData: {
  //     name: productData.name,
  //     variations: newProductVariations,
  //     categoryId: req.user.squareId,
  //   },
  // }

  for (let i = 0; i < productData.itemData.variations.length; i++) {
    productData.itemData.variations[i].customAttributeValues = {
      vendor_name: {
        stringValue: req.user.name,
      },
    }
  }

  productData.customAttributeValues = {
    vendor_name: {
      stringValue: req.user.name,
    },
  }
  productData.itemData.categoryId = req.user.squareId

  // console.log(productData.itemData.variations)
  // return res.status(StatusCodes.CREATED).json({ productData })

  const response = await squareClient.catalogApi.upsertCatalogObject({
    idempotencyKey: key,
    object: productData,
  })

  const parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))

  // get the new variation IDs to initialize inventory to 0
  if (response?.result?.idMappings) {
    const newVariationIds = response.result.idMappings.filter((el) => {
      var originalId = el.clientObjectId
      return originalId.includes('variation')
    })

    const inventoryChanges = newVariationIds
      .map((el) => {
        var locationCountObj = vendorLocations.map((location) => {
          return {
            type: 'PHYSICAL_COUNT',
            physicalCount: {
              catalogObjectId: el.objectId,
              state: 'IN_STOCK',
              locationId: location,
              quantity: '0',
              occurredAt: today.toISOString(),
            },
          }
        })

        return locationCountObj
      })
      .flat()

    const inventoryKey = nanoid()
    try {
      const inventoryResponse =
        await squareClient.inventoryApi.batchChangeInventory({
          idempotencyKey: inventoryKey,
          changes: inventoryChanges,
        })
      console.log(inventoryResponse.result)
      res.status(StatusCodes.CREATED).json({ parsedResponse })
    } catch (error) {
      console.log(error)
    }
  } else {
    res.status(StatusCodes.CREATED).json({ parsedResponse })
  }
}

export const getProduct = async (req, res, next) => {
  const { id: productID } = req.params

  /*can technically refactor this part into validation, but the API call to square takes so long that I want to do it all togehter here */
  try {
    const retrieveResponse =
      await squareClient.catalogApi.retrieveCatalogObject(productID, false)
    const itemVendor =
      retrieveResponse.result.object.customAttributeValues['vendor_name']
        .stringValue
    if (itemVendor != req.user.name) {
      throw new UnauthorizedError('not authorized to access this route')
    }
    const parsedResponse = JSONBig.parse(
      JSONBig.stringify(retrieveResponse.result)
    )
    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    throw new NotFoundError(`no product with id : ${productID}`)
  }
  /*refactor above */
}

export const updateProduct = async (req, res, next) => {
  const key = nanoid()
  const productData = req.body

  console.log(productData)

  try {
    const response = await squareClient.catalogApi.upsertCatalogObject({
      idempotencyKey: key,
      object: productData,
    })
    const parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))
    res.status(StatusCodes.OK).json({ parsedResponse })
  } catch (error) {
    console.log(error)
    throw new SquareApiError('Square API error trying to update product')
  }
}

export const deleteProduct = async (req, res, next) => {
  const { id: productID } = req.params

  try {
    const response = await squareClient.catalogApi.deleteCatalogObject(
      productID
    )
    const parsedResponse = JSONBig.parse(JSONBig.stringify(response))
    res.status(StatusCodes.OK).json({ parsedResponse })
  } catch (error) {
    throw new SquareApiError('error while calling the Square API')
  }
}

export const batchDeleteProducts = async (req, res, next) => {
  const productData = req.body

  // should check if the product ID belongs to that particular vendor
  try {
    const response = await squareClient.catalogApi.batchDeleteCatalogObjects({
      objectIds: productData.idsToDelete,
    })
    const parsedResponse = JSONBig.parse(JSONBig.stringify(response))
    res.status(StatusCodes.OK).json({ parsedResponse })
  } catch (error) {
    throw new SquareApiError('error while calling the Square API')
  }
}
