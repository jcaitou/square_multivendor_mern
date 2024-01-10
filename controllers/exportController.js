import { StatusCodes } from 'http-status-codes'
import agenda from '../jobs/agenda.js'
import { BadRequestError } from '../errors/customError.js'

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

export const exportOrders = async (req, res, next) => {
  const { month, year, locations: locationsQuery } = req.body
  const user = req.user

  console.log(locationsQuery)

  if (locationsQuery.length < 1) {
    throw new BadRequestError('at least one location must be selected')
  }

  agenda.now('export orders', {
    user,
    month,
    year,
    locationsQuery,
  })

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Export in progress, check your email' })
}
