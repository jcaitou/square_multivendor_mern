import { StatusCodes } from 'http-status-codes'
import User from '../models/UserModel.js'
import { squareClient } from '../utils/squareUtils.js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import { nanoid } from 'nanoid'
import JSONBig from 'json-bigint'

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId })
  const userWithoutPassword = user.toJSON()
  res.status(StatusCodes.OK).json({ user: userWithoutPassword })
}

export const getAllUsers = async (req, res) => {
  const users = await User.find({}, { settings: 0, password: 0 })
  res.status(StatusCodes.OK).json({ users })
}

export const updateUser = async (req, res) => {
  const obj = { ...req.body }
  delete obj.password
  const updatedUser = await User.findByIdAndUpdate(req.user.userId, obj)
  res.status(StatusCodes.OK).json({ msg: 'user updated' })
}

//if user is not active, then the "create products" and other functions will not appear for them
export const activateDeactivateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.body.userId, {
    active: req.body.makeActive,
  })
  res.status(StatusCodes.OK).json({
    msg: `user is now ${req.body.makeActive ? 'activated' : 'deactivated'}`,
  })
}

export const updateUserSettings = async (req, res) => {
  const { key, value } = req.body
  const user = await User.findOne({ _id: req.user.userId })
  const settings = { ...user.settings }
  settings[key] = value
  const updatedUser = await User.findByIdAndUpdate(req.user.userId, {
    settings: settings,
  })
  res.status(StatusCodes.OK).json({ msg: 'user updated' })
}

//THIS FUNCTION (updateUserLocations) IS NOT USED, BUT KEEP IT FOR NOW, IN CASE THE INVENTORY INITIALIZATION SCREWS UP IN THE FUTURE
export const updateUserLocations = async (req, res) => {
  const { userId, locationToAdd } = req.body
  //check that both userId and locationToAdd exists and is valid
  const today = new Date(Date.now())
  const user = await User.findOne({ _id: userId })
  const vendorLocations = user.locations

  if (vendorLocations.includes(locationToAdd)) {
    return res
      .status(StatusCodes.OK)
      .json({ msg: 'Location already exists for user' })
  }
  vendorLocations.push(locationToAdd)

  let searchQuery = {
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: user.name,
      },
    ],
  }

  let variationsInventoryUpdate = []

  //this part will be repeated in the while loop:
  let response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
  if (!response) {
    throw new SquareApiError('error while calling the Square API')
  }
  let cursor = response.result.cursor
  let products = response.result.items

  for (let i = 0; i < products.length; i++) {
    products[i].presentAtAllLocations = false
    products[i].presentAtLocationIds = vendorLocations

    for (let j = 0; j < products[i].itemData.variations.length; j++) {
      //for adding the location:
      products[i].itemData.variations[j].presentAtAllLocations = false
      products[i].itemData.variations[j].presentAtLocationIds = vendorLocations
      let tempLocationOverrides =
        products[i].itemData.variations[j].itemVariationData.locationOverrides
      tempLocationOverrides.push({
        locationId: locationToAdd,
        trackInventory: true,
        inventoryAlertType: 'LOW_QUANTITY',
        inventoryAlertThreshold: user.settings.defaultInventoryWarningLevel,
      })
      products[i].itemData.variations[j].itemVariationData.locationOverrides =
        tempLocationOverrides

      //for inventory initialization to 0
      const variationsInventory = products[i].itemData.variations.map(
        (variation) => {
          return {
            type: 'PHYSICAL_COUNT',
            physicalCount: {
              catalogObjectId: variation.id,
              state: 'IN_STOCK',
              locationId: locationToAdd,
              quantity: '0',
              occurredAt: today.toISOString(),
            },
          }
        }
      )
      variationsInventoryUpdate.push(variationsInventory)
    }
  }

  let upsertResponse = await squareClient.catalogApi.batchUpsertCatalogObjects({
    idempotencyKey: nanoid(),
    batches: [
      {
        objects: products,
      },
    ],
  })
  if (!upsertResponse) {
    throw new SquareApiError('error while updating product')
  }

  let inventoryResponse = await squareClient.inventoryApi.batchChangeInventory({
    idempotencyKey: nanoid(),
    changes: variationsInventoryUpdate.flat(),
  })
  if (!inventoryResponse) {
    throw new SquareApiError('error while updating inventory')
  }
  //above will be repeated in the while loop

  while (cursor != '') {
    searchQuery.cursor = cursor

    response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    if (!response) {
      throw new SquareApiError('error while calling the Square API')
    }
    cursor = response.result.cursor
    products = response.result.items

    for (let i = 0; i < products.length; i++) {
      products[i].presentAtAllLocations = false
      products[i].presentAtLocationIds = vendorLocations

      for (let j = 0; j < products[i].itemData.variations.length; j++) {
        //for adding the location:
        products[i].itemData.variations[j].presentAtAllLocations = false
        products[i].itemData.variations[j].presentAtLocationIds =
          vendorLocations
        let tempLocationOverrides =
          products[i].itemData.variations[j].itemVariationData.locationOverrides
        tempLocationOverrides.push({
          locationId: locationToAdd,
          trackInventory: true,
          inventoryAlertType: 'LOW_QUANTITY',
          inventoryAlertThreshold: user.settings.defaultInventoryWarningLevel,
        })
        products[i].itemData.variations[j].itemVariationData.locationOverrides =
          tempLocationOverrides

        //for inventory initialization to 0
        const variationsInventory = products[i].itemData.variations.map(
          (variation) => {
            return {
              type: 'PHYSICAL_COUNT',
              physicalCount: {
                catalogObjectId: variation.id,
                state: 'IN_STOCK',
                locationId: locationToAdd,
                quantity: '0',
                occurredAt: today.toISOString(),
              },
            }
          }
        )
        variationsInventoryUpdate.push(variationsInventory)
      }
    }

    let upsertResponse =
      await squareClient.catalogApi.batchUpsertCatalogObjects({
        idempotencyKey: nanoid(),
        batches: [
          {
            objects: products,
          },
        ],
      })
    if (!upsertResponse) {
      throw new SquareApiError('error while updating product')
    }

    let inventoryResponse =
      await squareClient.inventoryApi.batchChangeInventory({
        idempotencyKey: nanoid(),
        changes: variationsInventoryUpdate.flat(),
      })
    if (!inventoryResponse) {
      throw new SquareApiError('error while updating inventory')
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, {
    locations: vendorLocations,
  })

  return res.status(StatusCodes.OK).json({ msg: 'location added for user' })
}
