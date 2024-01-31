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
import User from '../models/UserModel.js'

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
  const { id: productID } = req.params
  const key = nanoid()
  const { title: productTitle, variations } = req.body
  const today = new Date(Date.now())

  const user = await User.findOne({ _id: req.user.userId })
  const userSku = user.skuId.toString(16).padStart(4, '0')

  const vendorLocations = req.user.locations

  const locationOverrides = vendorLocations.map((location) => {
    return {
      locationId: location,
      trackInventory: true,
      inventoryAlertType: 'LOW_QUANTITY',
      inventoryAlertThreshold:
        user.settings.defaultInventoryWarningLevel > 0
          ? user.settings.defaultInventoryWarningLevel
          : 0,
    }
  })

  let updateObj
  if (productID) {
    //there was already an existing product, copy values from productData to existing product
    const productResponse = await squareClient.catalogApi.retrieveCatalogObject(
      productID,
      false
    )
    const itemVendor =
      productResponse.result.object.customAttributeValues['vendor_name']
        .stringValue
    if (itemVendor != req.user.name) {
      throw new UnauthorizedError('not authorized to access this route')
    }

    updateObj = productResponse.result.object
    updateObj.itemData.name = productTitle.trim()

    for (let i = 0; i < variations.length; i++) {
      let isNewVariation = false
      if (variations[i].id.includes('#variation')) {
        isNewVariation = true
      }
      if (!isNewVariation) {
        const currIndex = updateObj.itemData.variations.findIndex((el) => {
          return el.id === variations[i].id
        })

        //if the variation is not new, then update the name, SKU, and price of new obj
        updateObj.itemData.variations[
          currIndex
        ].itemVariationData.sku = `${userSku}-${variations[i].sku.trim()}`
        updateObj.itemData.variations[currIndex].itemVariationData.name =
          variations[i].name.trim()
        updateObj.itemData.variations[
          currIndex
        ].itemVariationData.priceMoney.amount =
          Math.round(variations[i].price * 100) || 0
      } else {
        //update the old obj, then copy over to new obj
        const newVariation = {
          type: 'ITEM_VARIATION',
          id: variations[i].id,
          presentAtAllLocations: false,
          presentAtLocationIds: vendorLocations,
          customAttributeValues: {
            vendor_name: {
              stringValue: req.user.name,
            },
          },
          itemVariationData: {
            name: variations[i].name.trim() || productTitle.trim(),
            sku: `${userSku}-${variations[i].sku.trim()}` || '',
            pricingType: 'FIXED_PRICING',
            priceMoney: {
              amount: Math.round(variations[i].price * 100) || 0,
              currency: 'CAD',
            },
            trackInventory: true,
            locationOverrides: locationOverrides,
            availableForBooking: false,
            stockable: true,
          },
        }

        updateObj.itemData.variations = [
          ...updateObj.itemData.variations,
          newVariation,
        ]
      }
    }
  } else {
    //this is a new product

    const newProductVariations = variations.map((variation, index) => ({
      type: 'ITEM_VARIATION',
      id: `#variation${index}`,
      presentAtAllLocations: false,
      presentAtLocationIds: vendorLocations,
      customAttributeValues: {
        vendor_name: {
          stringValue: req.user.name,
        },
      },
      itemVariationData: {
        name: variation.name.trim() || productTitle.trim(),
        sku: `${userSku}-${variation.sku.trim()}` || '',
        pricingType: 'FIXED_PRICING',
        priceMoney: {
          amount: Math.round(variation.price * 100) || 0,
          currency: 'CAD',
        },
        trackInventory: true,
        locationOverrides: locationOverrides,
        availableForBooking: false,
        stockable: true,
      },
    }))

    updateObj = {
      type: 'ITEM',
      id: '#newitem',
      itemData: {
        name: productTitle.trim(),
        variations: newProductVariations,
      },
      categoryId: req.user.squareId,
      presentAtAllLocations: false,
      presentAtLocationIds: vendorLocations,
      customAttributeValues: {
        vendor_name: {
          stringValue: req.user.name,
        },
      },
    }
  }

  const response = await squareClient.catalogApi.upsertCatalogObject({
    idempotencyKey: key,
    object: updateObj,
  })

  const parsedResponse = JSONBig.parse(JSONBig.stringify(response.result))

  // get the new variation IDs to initialize inventory to 0
  //note: this part is currently not used
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
      // const inventoryResponse =
      //   await squareClient.inventoryApi.batchChangeInventory({
      //     idempotencyKey: inventoryKey,
      //     changes: inventoryChanges,
      //   })
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

    //I only want to return very specific values to the vendor - just enough for them to edit it
    const variations = retrieveResponse.result.object.itemData.variations.map(
      (variation) => {
        return {
          id: variation.id,
          name: variation.itemVariationData.name,
          sku: variation.itemVariationData.sku.slice(5),
          price: (
            Number(variation.itemVariationData.priceMoney.amount) / 100
          ).toFixed(2),
        }
      }
    )
    const title = retrieveResponse.result.object.itemData.name

    res.status(StatusCodes.OK).json({ title, variations })
  } catch (error) {
    throw new NotFoundError(`no product with id : ${productID}`)
  }
  /*refactor above */
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
