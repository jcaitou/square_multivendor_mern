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
import day from 'dayjs'

export const getAllOrders = async (req, res) => {
  const { startDate, endDate, sort, locations: locationsQuery } = req.query
  //allow sort by: date asc/dsc, price asc/dsc
  //allow search by: dates, locations

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

  const matchObj = {
    $and: [
      { 'orderItems.itemVendor': id },
      // { 'orderItems.itemName': 'Bird Hug Sticker' },
      // { location: locations },
      { location: { $exists: true, $in: locations } },
      // { location: 'L1NN4715DCC58' },
    ],
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
      $addFields: {
        totalPrice: {
          $sum: '$filteredOrderItems.totalMoney',
        },
      },
    },
    {
      $unset: 'orderItems',
    },
  ])
    .sort(sortKey)
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
      'orderItems.itemVendor': id,
      orderDate: { $gte: thisMonthStart.toDate() },
    },
  }

  const monthToDateQuery = await Order.aggregate([
    monthToDateQueryObj,
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

export const getSalesbyItem = async (req, res) => {
  const { startDate, endDate, sort } = req.query
  const { products } = req.body

  const id = new mongoose.Types.ObjectId(req.user.userId)

  const matchObj = {
    'orderItems.itemVendor': id,
  }

  if (products && products.length != 0) {
    matchObj['orderItems.itemVariationId'] = { $in: products }
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
  if (sort === 'qtyAsc') {
    sortQuery.quantity = 1
  } else if (sort === 'a-z') {
    delete sortQuery.quantity
  } else if (sort === 'z-a') {
    delete sortQuery.quantity
    sortQuery.name = -1
  }

  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 100
  const skip = (page - 1) * limit

  const orders = await Order.aggregate([
    queryObj,
    { $unwind: '$orderItems' },
    queryObj,
    {
      $group: {
        _id: '$orderItems.itemId',
        basePrice: { $first: '$orderItems.basePrice' },
        quantity: { $sum: '$orderItems.quantity' },
        price: { $sum: '$orderItems.totalMoney' },
        discounts: { $sum: '$orderItems.totalDiscount' },
        name: { $first: '$orderItems.itemName' },
      },
    },
    { $sort: sortQuery },
  ])
    .skip(skip)
    .limit(limit)

  const totalItems = await Order.aggregate([
    queryObj,
    { $unwind: '$orderItems' },
    queryObj,
    {
      $group: {
        _id: '$orderItems.itemId',
        basePrice: { $first: '$orderItems.basePrice' },
        quantity: { $sum: '$orderItems.quantity' },
        price: { $sum: '$orderItems.totalMoney' },
        discounts: { $sum: '$orderItems.totalDiscount' },
        name: { $first: '$orderItems.itemName' },
      },
    },
    { $sort: sortQuery },
  ])

  const totalOrders = totalItems.length
  const numOfPages = Math.ceil(totalOrders / limit)

  return res.status(StatusCodes.OK).json({
    sales: orders,
    totalItems: totalOrders,
    numOfPages,
    currentPage: page,
  })
}

export const getStats = async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.user.userId)
  //show: last 6 months revenue
  //this months' revnue/ all-time revnue
  //5-10 best-selling prodcuts: last 30 days / all time

  //number of products listed:
  let searchQuery = {
    limit: 100,
    customAttributeFilters: [
      {
        key: 'vendor_name',
        stringFilter: req.user.name,
      },
    ],
  }
  let response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
  if (!response) {
    throw new SquareApiError('error while calling the Square API')
  }
  let cursor = response.result.cursor
  let products = response.result.items

  while (cursor != '') {
    searchQuery.cursor = cursor

    //start of API calls
    response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    if (!response) {
      throw new SquareApiError('error while calling the Square API')
    }
    cursor = response.result.cursor
    products = products.concat(response.result.items)
  }

  console.log(products)
  console.log(products.length)

  //for all-time revenue:
  const allTimeQueryObj = {
    $match: {
      'orderItems.itemVendor': id,
    },
  }

  const allTimeQuery = await Order.aggregate([
    allTimeQueryObj,
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
      'orderItems.itemVendor': id,
      orderDate: { $gte: thisMonthStart.toDate() },
    },
  }

  const monthToDateQuery = await Order.aggregate([
    monthToDateQueryObj,
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

  //last 6 months revenue
  const sixMonthStart = day()
    .date(1)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(1)
    .subtract(6, 'month')

  const sixMonthsQueryObj = {
    $match: {
      'orderItems.itemVendor': id,
      orderDate: { $gte: sixMonthStart.toDate() },
    },
  }

  const sixMonthsQuery = await Order.aggregate([
    sixMonthsQueryObj,
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
      $addFields: {
        totalPrice: {
          $sum: '$filteredOrderItems.totalMoney',
        },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$orderDate' }, month: { $month: '$orderDate' } },
        count: { $sum: 1 },
        price: { $sum: '$totalPrice' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ])

  const sixMonthsSales = sixMonthsQuery
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item

      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY')
      return { date, count, revenue: item.price / 100.0 }
      // return { ...el, price: item.price / 100.0 }
    })
    .reverse()

  //best selling products: last 30 days:
  const lastThirtyDays = day()
    .date(1)
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(1)
    .subtract(30, 'day')

  const thiryDaysQueryObj = {
    $match: {
      'orderItems.itemVendor': id,
      orderDate: { $gte: lastThirtyDays.toDate() },
    },
  }

  const lastMonthBestsellersQuery = await Order.aggregate([
    thiryDaysQueryObj,
    { $unwind: '$orderItems' },
    thiryDaysQueryObj,
    {
      $group: {
        _id: '$orderItems.itemId',
        basePrice: { $first: '$orderItems.basePrice' },
        quantity: { $sum: '$orderItems.quantity' },
        price: { $sum: '$orderItems.totalMoney' },
        discounts: { $sum: '$orderItems.totalDiscount' },
        name: { $first: '$orderItems.itemName' },
      },
    },
    { $sort: { quantity: -1, name: 1 } },
    { $limit: 10 },
  ])

  //best selling products - month to date:
  const allTimeBestsellersQuery = await Order.aggregate([
    allTimeQueryObj,
    { $unwind: '$orderItems' },
    allTimeQueryObj,
    {
      $group: {
        _id: '$orderItems.itemId',
        basePrice: { $first: '$orderItems.basePrice' },
        quantity: { $sum: '$orderItems.quantity' },
        price: { $sum: '$orderItems.totalMoney' },
        discounts: { $sum: '$orderItems.totalDiscount' },
        name: { $first: '$orderItems.itemName' },
      },
    },
    { $sort: { quantity: -1, name: 1 } },
    { $limit: 10 },
  ])

  return res.status(StatusCodes.OK).json({
    allTimeTotal: allTimeQuery[0]?.price || 0,
    monthToDateTotal: monthToDateQuery[0]?.price || 0,
    sixMonthsSales,
    allTimeBestsellers: allTimeBestsellersQuery,
    lastMonthBestsellers: lastMonthBestsellersQuery,
    productCount: products.length,
  })
}
