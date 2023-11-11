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

//needed for function below:
import Order from '../models/OrderModel.js'
import mongoose from 'mongoose'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import day from 'dayjs'
import createCsvWriter from 'csv-writer'
import { ALL_LOCATIONS } from '../utils/constants.js'

export const exportOrders = async (req, res, next) => {
  // agenda.now('export all products', {
  //   squareName: req.user.name,
  //   userId: req.user.userId,
  // })

  const { startDate, endDate, locations: locationsQuery } = req.body

  //copy below
  const user = req.user
  const id = new mongoose.Types.ObjectId(user.userId)

  let locations
  if (!locationsQuery) {
    locations = user.locations
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
  const sortKey = '-orderDate'

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
  ]).sort(sortKey)

  //write to csv initialization
  const date = day().format('YYYY-MM-DD')
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const resultFilepath = path.resolve(
    __dirname,
    '../public/uploads',
    `${date}-${user.name}-order-export.csv`
  )

  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: resultFilepath,
    header: [
      { id: 'orderId', title: 'Order ID' },
      { id: 'location', title: 'Location' },
      { id: 'orderDate', title: 'Order Date' },
      { id: 'itemName', title: 'Item Name' },
      { id: 'itemVariationName', title: 'Variation Name' },
      { id: 'itemSku', title: 'SKU' },
      { id: 'quantity', title: 'Quantity' },
      { id: 'basePrice', title: 'Base Price' },
      { id: 'totalDiscount', title: 'Discount Applied' },
      { id: 'totalMoney', title: 'Sale Price' },
      { id: 'itemId', title: 'Item ID' },
      { id: 'itemVariationId', title: 'Variation ID' },
    ],
  })
  //write to csv initialization - end

  //start of write to csv
  for (let i = 0; i < orders.length; i++) {
    for (let j = 0; j < orders[i].filteredOrderItems.length; j++) {
      const locationName = ALL_LOCATIONS.find((el) => {
        return el.id === orders[i].location
      })
      await csvWriter.writeRecords([
        {
          orderId: orders[i].orderId,
          location: locationName.name,
          orderDate: orders[i].orderDate,
          itemName: orders[i].filteredOrderItems[j].itemName,
          itemVariationName: orders[i].filteredOrderItems[j].itemVariationName,
          itemSku: orders[i].filteredOrderItems[j]?.itemSku || '',
          // itemSku: '',
          quantity: orders[i].filteredOrderItems[j].quantity,
          basePrice: orders[i].filteredOrderItems[j].basePrice / 100.0,
          totalDiscount: orders[i].filteredOrderItems[j].totalDiscount / 100.0,
          totalMoney: orders[i].filteredOrderItems[j].totalMoney / 100.0,
          itemId: orders[i].filteredOrderItems[j].itemId,
          itemVariationId: orders[i].filteredOrderItems[j].itemVariationId,
        },
      ])
    }
  }
  //end of write to csv

  //copy above

  res.status(StatusCodes.CREATED).json({ orders })
}
