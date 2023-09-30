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

export const getAllProducts = async (req, res) => {
  try {
    const response = await squareClient.catalogApi.searchCatalogItems({
      customAttributeFilters: [
        {
          key: 'vendor_name',
          stringFilter: req.user.squareName,
        },
      ],
    })
    const parsedResponse = JSONBig.parse(
      JSONBig.stringify(response.result.items)
    )
    res.status(StatusCodes.OK).json(parsedResponse)
  } catch (error) {
    throw new SquareApiError('error while calling the Square API')
  }
}

export const createProduct = async (req, res) => {
  const key = nanoid()
  const productData = req.body

  /* refactor this into product input validation */
  if (productData.variations.length < 1) {
    console.log('at least one variation is required')
  }
  /* refactor above */

  var newProductVariations = productData.variations.map((variation, index) => ({
    type: 'ITEM_VARIATION',
    id: `#variation${index}`,
    itemVariationData: {
      name: variation.name || productData.name,
      sku: variation.sku || '',
      pricingType: 'FIXED_PRICING',
      priceMoney: {
        amount: variation.price || 0,
        currency: 'CAD',
      },
      trackInventory: true,
      availableForBooking: false,
      stockable: true,
    },
  }))

  var newObject = {
    type: 'ITEM',
    id: '#newitem',
    customAttributeValues: {
      vendor_name: {
        stringValue: req.user.squareName,
      },
    },
    itemData: {
      name: productData.name,
      variations: newProductVariations,
      categoryId: req.user.squareId,
    },
  }

  const response = await squareClient.catalogApi.upsertCatalogObject({
    idempotencyKey: key,
    object: newObject,
  })
  const parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))
  res.status(StatusCodes.CREATED).json({ parsedResponse })
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
    if (itemVendor != req.user.squareName) {
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

  /*can technically refactor this part into validation, but the API call to square takes so long that I want to do it all togehter here */
  try {
    const retrieveResponse =
      await squareClient.catalogApi.retrieveCatalogObject(productID, false)
    const itemVendor =
      retrieveResponse.result.object.customAttributeValues['vendor_name']
        .stringValue
    if (itemVendor != req.user.squareName) {
      throw new UnauthorizedError('not authorized to access this route')
    }
  } catch (error) {
    throw new NotFoundError(`no product with id : ${productID}`)
  }
  /*refactor above */

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
