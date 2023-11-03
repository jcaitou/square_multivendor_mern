import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import { squareClient } from '../utils/squareUtils.js'
import JSONBig from 'json-bigint'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import Order from '../models/OrderModel.js'
import mongoose from 'mongoose'

export const getAllOrders = async (req, res) => {
  const { startDate, endDate } = req.query

  const id = new mongoose.Types.ObjectId(req.user.userId)

  const matchObj = {
    'orderItems.itemVendor': id,
  }
  let dateQuery = {}
  if (startDate) {
    dateQuery.$gte = new Date(startDate)
  }
  if (endDate) {
    dateQuery.$lte = new Date(endDate)
  }
  if (startDate || endDate) {
    matchObj.orderDate = dateQuery
  }

  const queryObj = {
    $match: matchObj,
  }

  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 100
  const skip = (page - 1) * limit

  const orders = await Order.aggregate([
    queryObj,
    {
      $addFields: {
        filteredOrderItems: {
          $filter: {
            input: '$orderItems',
            as: 'd',
            cond: {
              $eq: ['$$d.itemVendor', id],
            },
          },
        },
      },
    },
    {
      $unset: 'orderItems',
    },
  ])
    .skip(skip)
    .limit(limit)

  const totalOrdersQuery = await Order.aggregate([
    queryObj,
    {
      $addFields: {
        filteredOrderItems: {
          $filter: {
            input: '$orderItems',
            as: 'd',
            cond: {
              $eq: ['$$d.itemVendor', id],
            },
          },
        },
        totalPrice: {
          $sum: '$orderItems.totalMoney',
        },
      },
    },
    {
      $group: {
        _id: '$location',
        n: { $sum: 1 },
        price: { $sum: '$totalPrice' },
      },
    },
  ])

  const totalOrders = totalOrdersQuery[0]?.n || 0
  const numOfPages = Math.ceil(totalOrders / limit)

  const ordersMoneyTotal = totalOrdersQuery[0]?.price || 0

  return res.status(StatusCodes.OK).json({
    orders,
    numOfPages,
    currentPage: page,
    ordersMoneyTotal,
    totalOrders: totalOrders,
  })
}

export const getSalesbyItem = async (req, res) => {
  const { startDate, endDate, sort } = req.query
  const { products } = req.body

  const id = new mongoose.Types.ObjectId(req.user.userId)

  const matchObj = {
    'orderItems.itemVendor': id,
    'orderItems.itemVariationId': { $in: products },
  }

  let dateQuery = {}
  if (startDate) {
    dateQuery.$gte = new Date(startDate)
  }
  if (endDate) {
    dateQuery.$lte = new Date(endDate)
  }
  if (startDate || endDate) {
    matchObj.orderDate = dateQuery
  }

  const queryObj = {
    $match: matchObj,
  }

  const sortQuery = { quantity: -1, name: 1 }
  if (sort === 'a-z') {
    delete sortQuery.quantity
  }

  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 3
  const skip = (page - 1) * limit

  const orders = await Order.aggregate([
    queryObj,
    { $unwind: '$orderItems' },
    queryObj,
    {
      $group: {
        _id: '$orderItems.itemVariationId',
        quantity: { $sum: '$orderItems.quantity' },
        price: { $sum: '$orderItems.totalMoney' },
        discounts: { $sum: '$orderItems.totalDiscount' },
        name: { $first: '$orderItems.itemName' },
      },
    },
    { $sort: sortQuery },
  ])

  return res.status(StatusCodes.OK).json({
    orders,
  })
}
