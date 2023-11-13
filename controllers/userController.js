import { StatusCodes } from 'http-status-codes'
import User from '../models/UserModel.js'

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId })
  const userWithoutPassword = user.toJSON()
  res.status(StatusCodes.OK).json({ user: userWithoutPassword })
}

export const getApplicationStats = async (req, res) => {
  const users = await User.countDocuments()
  const jobs = await Job.countDocuments()
  res.status(StatusCodes.OK).json({ users, jobs })
}

export const updateUser = async (req, res) => {
  const obj = { ...req.body }
  delete obj.password
  const updatedUser = await User.findByIdAndUpdate(req.user.userId, obj)
  res.status(StatusCodes.OK).json({ msg: 'user updated' })
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

export const updateUserLocations = async (req, res) => {
  // change locations array in mongo
  //call square API - return list of all items and item variations that belong to vendor

  //product object:
  // productData.presentAtAllLocations = false
  // productData.presentAtLocationIds = vendorLocations
  //variation object:
  // productData.itemData.variations[i].presentAtAllLocations = false
  // productData.itemData.variations[i].presentAtLocationIds = vendorLocations
  // var locationOverrides = vendorLocations.map((location) => {
  //   return {
  //     locationId: location,
  //     trackInventory: true,
  //     inventoryAlertType: 'LOW_QUANTITY',
  //     inventoryAlertThreshold: user.settings.defaultInventoryWarningLevel,
  //   }
  // })
  // productData.itemData.variations[
  //   i
  // ].itemVariationData.locationOverrides = locationOverrides

  //call square API to update product info
  //call square API to update inventory counts - initialize all to 0

  res.status(StatusCodes.OK).json({ msg: 'user updated' })
}
