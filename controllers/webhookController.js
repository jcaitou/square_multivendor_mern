import { StatusCodes } from 'http-status-codes'
import { squareClient } from '../utils/squareUtils.js'
import JSONBig from 'json-bigint'
import { NotFoundError, SquareApiError } from '../errors/customError.js'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'

export const createOrder = async (req, res) => {
  const orderId = req.body.data.id

  const responseTemp = await squareClient.ordersApi.retrieveOrder(orderId)

  if (responseTemp?.statusCode < 200 || responseTemp?.statusCode > 299) {
    throw new SquareApiError('error while calling the Square API')
  }

  const response = JSONBig.parse(JSONBig.stringify(responseTemp))

  const orderItemsPromise = response.result.order.lineItems.map(
    async (item) => {
      const itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
        item.catalogObjectId,
        false
      )

      if (responseTemp?.statusCode < 200 || responseTemp?.statusCode > 299) {
        throw new SquareApiError('error while calling the Square API')
      }
      let vendorName =
        itemResponse.result.object.customAttributeValues.vendor_name.stringValue
      const user = await User.findOne({ squareName: vendorName })

      if (!user) {
        throw new NotFoundError('user not found')
      }
      return {
        itemName: item.name,
        itemVariationId: item.catalogObjectId,
        quantity: item.quantity,
        basePrice: item.basePriceMoney.amount,
        totalDiscount: item.totalDiscountMoney.amount,
        totalMoney: item.totalMoney.amount,
        itemVendor: user._id,
      }
    }
  )
  const orderItems = await Promise.all(orderItemsPromise)

  const orderInfo = {
    orderId: req.body.data.id,
    location: response.result.order.locationId,
    orderDate: response.result.order.updatedAt,
    orderItems: orderItems,
  }

  const newOrder = await Order.create(orderInfo)

  return res.status(StatusCodes.CREATED).json({ newOrder })
}

export const updateOrder = async (req, res) => {
  const orderId = req.body.data.id

  const orderCreatedAt = Date.parse(
    req.body.data.object.order_updated.created_at
  )
  const updateTime = Date.parse(req.body.data.object.order_updated.updated_at)
  console.log(updateTime - orderCreatedAt)

  if (updateTime - orderCreatedAt < 5000) {
    //if the update is less than 5s after creation time, just skip it
    return res.status(StatusCodes.OK).json({ msg: 'ok' })
  }

  const existingOrder = await Order.findOne({ orderId: orderId })
  if (!existingOrder) {
    return res.status(StatusCodes.OK).json({ msg: 'Order does not exist  yet' })
  }

  //once we've passed all the checks, find the order info and update the order:
  const responseTemp = await squareClient.ordersApi.retrieveOrder(orderId)

  if (responseTemp?.statusCode < 200 || responseTemp?.statusCode > 299) {
    throw new SquareApiError('error while calling the Square API')
  }

  const response = JSONBig.parse(JSONBig.stringify(responseTemp))

  const orderItemsPromise = response.result.order.lineItems.map(
    async (item) => {
      const itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
        item.catalogObjectId,
        false
      )

      if (responseTemp?.statusCode < 200 || responseTemp?.statusCode > 299) {
        throw new SquareApiError('error while calling the Square API')
      }
      let vendorName =
        itemResponse.result.object.customAttributeValues.vendor_name.stringValue
      const user = await User.findOne({ squareName: vendorName })

      if (!user) {
        throw new NotFoundError('user not found')
      }
      return {
        itemName: item.name,
        itemVariationId: item.catalogObjectId,
        quantity: item.quantity,
        basePrice: item.basePriceMoney.amount,
        totalDiscount: item.totalDiscountMoney.amount,
        totalMoney: item.totalMoney.amount,
        itemVendor: user._id,
      }
    }
  )
  const orderItems = await Promise.all(orderItemsPromise)

  const orderInfo = {
    orderId: req.body.data.id,
    location: response.result.order.locationId,
    orderDate: response.result.order.updatedAt,
    orderItems: orderItems,
  }

  const newOrder = await Order.findByIdAndUpdate(existingOrder._id, orderInfo, {
    new: true,
  })

  return res.status(StatusCodes.OK).json({ newOrder })
}
