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
import User from '../models/UserModel.js'
import mongoose from 'mongoose'
import day from 'dayjs'

export const getAllOrdersAdm = async (req, res) => {
  const { startDate, endDate, sort, locations: locationsQuery } = req.query

  //search by locations:
  let locations
  if (!locationsQuery) {
    locations = req.user.locations
  } else if (Array.isArray(locationsQuery)) {
    locations = locationsQuery
  } else {
    locations = [locationsQuery]
  }

  const matchObj = {
    $and: [{ location: { $exists: true, $in: locations } }],
  }

  //search by dates:
  let dateQuery = {}
  if (startDate) {
    dateQuery.$gte = new Date(startDate)
  }
  if (endDate) {
    const formattedEndDate = day(endDate)
      .hour(23)
      .minute(59)
      .second(59)
      .millisecond(990)
    dateQuery.$lte = formattedEndDate.toDate()
  }
  if (startDate || endDate) {
    matchObj.orderDate = dateQuery
  }

  const queryObj = {
    $match: matchObj,
  }

  //sort
  const sortOptions = {
    dateDesc: '-orderDate',
    dateAsc: 'orderDate',
    priceDesc: '-totalPrice',
    priceAsc: 'totalPrice',
  }

  const sortKey = sortOptions[sort] || sortOptions.dateDesc

  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 100
  const skip = (page - 1) * limit

  const orders = await Order.aggregate([
    queryObj,
    {
      $set: {
        filteredOrderItems: '$orderItems',
        orderItems: '$$REMOVE',
      },
    },
    {
      $addFields: {
        totalPrice: {
          $sum: '$filteredOrderItems.totalMoney',
        },
      },
    },
  ])
    .sort(sortKey)
    .skip(skip)
    .limit(limit)

  const totalOrdersQuery = await Order.aggregate([
    queryObj,
    {
      $set: {
        filteredOrderItems: '$orderItems',
        orderItems: '$$REMOVE',
      },
    },
    {
      $addFields: {
        totalPrice: {
          $sum: '$filteredOrderItems.totalMoney',
        },
      },
    },
    {
      $group: {
        _id: null,
        n: { $sum: 1 },
        price: { $sum: '$totalPrice' },
      },
    },
  ])

  //for the current month revenue:
  const thisMonthStart = day()
    .date(1)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(1)

  const monthToDateQueryObj = {
    $match: {
      orderDate: { $gte: thisMonthStart.toDate() },
    },
  }

  const monthToDateQuery = await Order.aggregate([
    monthToDateQueryObj,
    {
      $set: {
        filteredOrderItems: '$orderItems',
        orderItems: '$$REMOVE',
      },
    },
    {
      $addFields: {
        totalPrice: {
          $sum: '$filteredOrderItems.totalMoney',
        },
      },
    },
    {
      $group: {
        _id: null,
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
    monthToDateTotal: monthToDateQuery[0]?.price || 0,
    totalOrders: totalOrders,
  })
}

export const getSalesbyItemAdm = async (req, res) => {
  const {
    startDate,
    endDate,
    sort,
    locations: locationsQuery,
    vendorStatus,
  } = req.query
  const { products } = req.body

  const id = new mongoose.Types.ObjectId(req.user.userId)

  //search by locations:
  let locations
  if (!locationsQuery) {
    locations = req.user.locations
  } else if (Array.isArray(locationsQuery)) {
    locations = locationsQuery
  } else {
    locations = [locationsQuery]
  }

  let matchObj
  matchObj = {
    $and: [{ location: { $exists: true, $in: locations } }],
  }

  if (products && products.length != 0) {
    matchObj['orderItems.itemVariationId'] = { $in: products }
  }

  let dateQuery = {}
  if (startDate) {
    dateQuery.$gte = new Date(startDate)
  }
  if (endDate) {
    const formattedEndDate = day(endDate)
      .hour(23)
      .minute(59)
      .second(59)
      .millisecond(990)
    dateQuery.$lte = formattedEndDate.toDate()
  }

  if (startDate || endDate) {
    matchObj.orderDate = dateQuery
  }

  const queryObj = {
    $match: matchObj,
  }

  let sortQuery = { quantity: -1, price: -1, name: 1 }
  if (sort === 'qtyAsc') {
    sortQuery = { quantity: 1, price: -1, name: 1 }
  } else if (sort === 'a-z') {
    sortQuery = { name: 1, quantity: -1, price: -1 }
  } else if (sort === 'z-a') {
    sortQuery = { name: -1, quantity: -1, price: -1 }
  } else if (sort === 'revDesc') {
    sortQuery = { price: -1, quantity: -1, name: 1 }
  } else if (sort === 'revAsc') {
    sortQuery = { price: 1, quantity: -1, name: 1 }
  }

  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 100
  const skip = (page - 1) * limit

  //second stage match for filtering active vendors
  let vendorMatch = null
  if (vendorStatus === 'active') {
    vendorMatch = {
      $match: { 'vendor.active': true },
    }
  } else if (vendorStatus === 'inactive') {
    vendorMatch = {
      $match: { 'vendor.active': false },
    }
  }
  console.log(vendorStatus)

  const aggregateQuery = [
    queryObj,
    { $unwind: '$orderItems' },
    queryObj,
    {
      $lookup: {
        from: 'users',
        localField: 'orderItems.itemVendor',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $unwind: '$vendor',
    },
  ]
  if (vendorMatch) {
    aggregateQuery.push(vendorMatch)
  }
  aggregateQuery.push(
    {
      $project: {
        'orderItems.itemId': 1,
        'orderItems.itemName': 1,
        'orderItems.quantity': 1,
        'orderItems.basePrice': 1,
        'orderItems.totalMoney': 1,
        'orderItems.totalDiscount': 1,
        'vendor.name': 1,
      },
    },
    {
      $group: {
        _id: '$orderItems.itemId',
        basePrice: { $first: '$orderItems.basePrice' },
        quantity: { $sum: '$orderItems.quantity' },
        price: { $sum: '$orderItems.totalMoney' },
        discounts: { $sum: '$orderItems.totalDiscount' },
        name: { $first: '$orderItems.itemName' },
        vendor: { $first: '$vendor.name' },
      },
    },
    { $sort: sortQuery }
  )

  const items = await Order.aggregate([aggregateQuery])

  // const totalItems = await Order.aggregate([
  //   queryObj,
  //   { $unwind: '$orderItems' },
  //   queryObj,
  //   {
  //     $group: {
  //       _id: '$orderItems.itemId',
  //       basePrice: { $first: '$orderItems.basePrice' },
  //       quantity: { $sum: '$orderItems.quantity' },
  //       price: { $sum: '$orderItems.totalMoney' },
  //       discounts: { $sum: '$orderItems.totalDiscount' },
  //       name: { $first: '$orderItems.itemName' },
  //     },
  //   },
  //   { $sort: sortQuery },
  // ])

  const totalOrders = items.length
  const numOfPages = Math.ceil(totalOrders / limit)

  return res.status(StatusCodes.OK).json({
    sales: items,
    totalItems: totalOrders,
    numOfPages,
    currentPage: page,
  })
}

export const getSalesByVendorAdm = async (req, res) => {
  const {
    startDate,
    endDate,
    sort,
    locations: locationsQuery,
    vendorStatus,
  } = req.query

  //search by locations:
  let locations
  if (!locationsQuery) {
    locations = req.user.locations
  } else if (Array.isArray(locationsQuery)) {
    locations = locationsQuery
  } else {
    locations = [locationsQuery]
  }

  const matchObj = {
    $and: [{ location: { $exists: true, $in: locations } }],
  }

  //search by dates:
  let dateQuery = {}
  if (startDate) {
    dateQuery.$gte = new Date(startDate)
  }
  if (endDate) {
    const formattedEndDate = day(endDate)
      .hour(23)
      .minute(59)
      .second(59)
      .millisecond(990)
    dateQuery.$lte = formattedEndDate.toDate()
  }
  if (startDate || endDate) {
    matchObj.orderDate = dateQuery
  }

  const queryObj = {
    $match: matchObj,
  }

  let sortQuery = { n: -1, price: -1, vendorName: 1 }
  if (sort === 'qtyAsc') {
    sortQuery = { n: 1, price: -1, vendorName: 1 }
  } else if (sort === 'a-z') {
    sortQuery = { vendorName: 1, n: -1, price: -1 }
  } else if (sort === 'z-a') {
    sortQuery = { vendorName: -1, n: -1, price: -1 }
  } else if (sort === 'revDesc') {
    sortQuery = { price: -1, n: -1, vendorName: 1 }
  } else if (sort === 'revAsc') {
    sortQuery = { price: 1, n: -1, vendorName: 1 }
  }

  //second stage match for filtering active vendors
  let vendorMatch = null
  if (vendorStatus === 'active') {
    vendorMatch = {
      $match: { 'vendor.active': true },
    }
  } else if (vendorStatus === 'inactive') {
    vendorMatch = {
      $match: { 'vendor.active': false },
    }
  }
  console.log(vendorStatus)

  const aggregateQuery = [
    queryObj,
    { $unwind: '$orderItems' },
    queryObj,
    {
      $lookup: {
        from: 'users',
        localField: 'orderItems.itemVendor',
        foreignField: '_id',
        as: 'vendor',
      },
    },
    {
      $unwind: '$vendor',
    },
  ]
  if (vendorMatch) {
    aggregateQuery.push(vendorMatch)
  }
  aggregateQuery.push(
    {
      $project: {
        'orderItems.itemVendor': 1,
        'orderItems.totalMoney': 1,
        'vendor.name': 1,
      },
    },
    {
      $group: {
        _id: '$orderItems.itemVendor',
        vendorName: { $first: '$vendor.name' },
        n: { $sum: 1 },
        price: { $sum: '$orderItems.totalMoney' },
      },
    },
    { $sort: sortQuery }
  )

  const totalOrdersQuery = await Order.aggregate(aggregateQuery)

  // await User.populate(totalOrdersQuery, { path: '_id', select: '_id name' })

  return res.status(StatusCodes.OK).json(totalOrdersQuery)
}
