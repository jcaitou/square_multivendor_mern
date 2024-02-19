import { StatusCodes } from 'http-status-codes'
import Location from '../models/LocationModel.js'
import User from '../models/UserModel.js'
import Discount from '../models/DiscountModel.js'
import { squareClient } from '../utils/squareUtils.js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import { nanoid } from 'nanoid'
import JSONBig from 'json-bigint'

export const getAllLocations = async (req, res) => {
  const locations = await Location.find()
  res.status(StatusCodes.OK).json({ locations })
}

//input: req.body.name
//new locations are automatically added to admin accounts
export const createLocation = async (req, res) => {
  const locationName = req.body.name

  let response
  try {
    response = await squareClient.locationsApi.createLocation({
      location: {
        name: locationName,
      },
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while calling the Square API'
    )
  }

  const locationId = response.result.location.id

  if (!locationId) {
    throw new SquareApiError(
      'location ID was not successfully obtained from location creation'
    )
  }

  const newLocation = await Location.create({
    name: locationName,
    _id: locationId,
  })

  const admins = await User.updateMany(
    { role: 'admin' },
    {
      $addToSet: {
        locations: locationId,
        locationsHistory: locationId,
      },
    }
  )

  res.status(StatusCodes.CREATED).json({ newLocation })
}

//this assumes that the vendor already has an account!
//input:
//req.body.userId (vendor to assign the new location to)
//req.body.locationId (location to be assigned)
export const assignLocation = async (req, res) => {
  const locationToAdd = req.body.locationId
  const userId = req.body.userId
  const user = await assignLocationInner(locationToAdd, userId)
  res.status(StatusCodes.OK).json({ user })
}
export const assignLocationInner = async (locationToAdd, userId) => {
  // const locationToAdd = req.body.locationId
  const location = await Location.findById(locationToAdd)
  if (!location) {
    throw new BadRequestError('invalid location ID')
  }

  const user = await User.findOne({ _id: userId })
  const currentLocations = user.locations
  const allLocations = user.locationsHistory
  if (currentLocations.includes(locationToAdd)) {
    return user.toJSON()
  } else {
    currentLocations.push(locationToAdd)
  }

  if (allLocations.indexOf(locationToAdd) === -1) {
    allLocations.push(locationToAdd)
  }

  // MAKING THE ITEM SELLABLE IN SQUARE
  let searchQuery = {
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: user.name,
      },
    ],
  }

  //this part will be repeated in the while loop:
  const loopFunction = async (searchQuery) => {
    let response
    // let response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    // if (!response) {
    //   throw new SquareApiError('error while calling the Square API')
    // }

    try {
      response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while calling the Square API'
      )
    }

    let cursor = response.result.cursor
    let products = response.result.items

    for (let i = 0; i < products.length; i++) {
      products[i].presentAtAllLocations = false
      products[i].presentAtLocationIds = currentLocations

      for (let j = 0; j < products[i].itemData.variations.length; j++) {
        //for adding the location:
        products[i].itemData.variations[j].presentAtAllLocations = false
        products[i].itemData.variations[j].presentAtLocationIds =
          currentLocations
        let tempLocationOverrides = products[i].itemData.variations[
          j
        ].itemVariationData.locationOverrides.filter((obj) => {
          return obj.locationId != locationToAdd
        })

        tempLocationOverrides.push({
          locationId: locationToAdd,
          trackInventory: true,
          inventoryAlertType: 'LOW_QUANTITY',
          inventoryAlertThreshold: user.settings.defaultInventoryWarningLevel,
        })
        products[i].itemData.variations[j].itemVariationData.locationOverrides =
          tempLocationOverrides
      }
    }
    return { products, cursor }
  }
  var { products, cursor } = await loopFunction(searchQuery)

  try {
    await squareClient.catalogApi.batchUpsertCatalogObjects({
      idempotencyKey: nanoid(),
      batches: [
        {
          objects: products,
        },
      ],
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while updating product'
    )
  }

  //above will be repeated in the while loop

  while (cursor != '') {
    searchQuery.cursor = cursor

    // response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    // if (!response) {
    //   throw new SquareApiError('error while calling the Square API')
    // }
    // cursor = response.result.cursor
    // products = response.result.items

    var { products, cursor } = await loopFunction(searchQuery)

    try {
      await squareClient.catalogApi.batchUpsertCatalogObjects({
        idempotencyKey: nanoid(),
        batches: [
          {
            objects: products,
          },
        ],
      })
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while updating product'
      )
    }
  }

  //below is for intiializing discounts to the newly assigned:
  const discounts = await Discount.find({ createdBy: userId })
  const discountIds = discounts
    .map((el) => [el.pricingRuleId, el.discountId, el.productSetId])
    .flat()
  for (let i = 0; i < discountIds.length; i++) {
    let discountResponse
    try {
      discountResponse = await squareClient.catalogApi.retrieveCatalogObject(
        discountIds[i],
        false
      )
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while updating product'
      )
    }

    const discountObject = discountResponse.result.object
    discountObject.presentAtAllLocations = false
    discountObject.presentAtLocationIds = currentLocations

    try {
      await squareClient.catalogApi.upsertCatalogObject({
        idempotencyKey: nanoid(),
        object: discountObject,
      })
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while updating product'
      )
    }
  }
  //above is for intiializing discounts to the new store:

  const updatedVendor = await User.findByIdAndUpdate(
    userId,
    {
      locations: currentLocations,
      locationsHistory: allLocations,
    },
    {
      new: true,
    }
  )
  const userWithoutPassword = updatedVendor.toJSON()

  return userWithoutPassword
}

export const removeLocation = async (req, res) => {
  const locationToRemove = req.body.locationId
  const location = await Location.findById(locationToRemove)
  if (!location) {
    throw new BadRequestError('invalid location ID')
  }

  const user = await User.findOne({ _id: req.body.userId })
  var currentLocations
  if (!user.locations.includes(locationToRemove)) {
    throw new BadRequestError('Location does not exist for user')
  } else {
    currentLocations = user.locations.filter((location) => {
      return location != locationToRemove
    })
  }

  // MAKING THE ITEM UNSELLABLE IN SQUARE
  let searchQuery = {
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: user.name,
      },
    ],
  }

  //this part will be repeated in the while loop:
  const loopFunction = async (searchQuery) => {
    let response
    // let response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    // if (!response) {
    //   throw new SquareApiError('error while calling the Square API')
    // }

    try {
      response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while calling the Square API'
      )
    }

    let cursor = response.result.cursor
    let products = response.result.items

    for (let i = 0; i < products.length; i++) {
      products[i].presentAtAllLocations = false
      products[i].presentAtLocationIds = currentLocations

      for (let j = 0; j < products[i].itemData.variations.length; j++) {
        //for adding the location:
        products[i].itemData.variations[j].presentAtAllLocations = false
        products[i].itemData.variations[j].presentAtLocationIds =
          currentLocations
        let tempLocationOverrides = products[i].itemData.variations[
          j
        ].itemVariationData.locationOverrides.filter((obj) => {
          return obj.locationId != locationToRemove
        })

        tempLocationOverrides.push({
          locationId: locationToRemove,
          trackInventory: true,
        })
        products[i].itemData.variations[j].itemVariationData.locationOverrides =
          tempLocationOverrides
      }
    }
    return { products, cursor }
  }
  var { products, cursor } = await loopFunction(searchQuery)

  try {
    await squareClient.catalogApi.batchUpsertCatalogObjects({
      idempotencyKey: nanoid(),
      batches: [
        {
          objects: products,
        },
      ],
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while updating product'
    )
  }

  while (cursor != '') {
    searchQuery.cursor = cursor
    var { products, cursor } = await loopFunction(searchQuery)

    try {
      await squareClient.catalogApi.batchUpsertCatalogObjects({
        idempotencyKey: nanoid(),
        batches: [
          {
            objects: products,
          },
        ],
      })
    } catch (error) {
      throw new SquareApiError(
        error?.errors[0].detail || 'error while updating product'
      )
    }
  }

  const updatedVendor = await User.findByIdAndUpdate(
    req.body.userId,
    {
      locations: currentLocations,
    },
    {
      new: true,
    }
  )
  const userWithoutPassword = updatedVendor.toJSON()

  res.status(StatusCodes.OK).json({ user: userWithoutPassword })
}
