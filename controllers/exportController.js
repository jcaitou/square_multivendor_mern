import { StatusCodes } from 'http-status-codes'
import agenda from '../jobs/agenda.js'

export const exportAllProducts = async (req, res, next) => {
  agenda.now('export all products', {
    squareName: req.user.name,
    userId: req.user.userId,
  })
  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Export in progress, check your email' })
}

export const exportAllInventory = async (req, res, next) => {
  agenda.now('export all inventory', {
    squareName: req.user.name,
    userId: req.user.userId,
    locations: req.user.locations,
  })
  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Export in progress, check your email' })
}
