import { StatusCodes } from 'http-status-codes'
import { squareClient } from '../utils/squareUtils.js'
import JSONBig from 'json-bigint'
import { NotFoundError, SquareApiError } from '../errors/customError.js'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import { transporter } from '../middleware/nodemailerMiddleware.js'
import day from 'dayjs'

export const createOrder = async (req, res) => {
  const orderId = req.body.data.id

  const existingOrder = await Order.findOne({ orderId: orderId })
  if (existingOrder) {
    return res
      .status(StatusCodes.OK)
      .json({ msg: 'Order already exists, will not create a new one' })
  }

  const responseTemp = await squareClient.ordersApi.retrieveOrder(orderId)

  if (responseTemp?.statusCode < 200 || responseTemp?.statusCode > 299) {
    throw new SquareApiError('error while calling the Square API')
  }

  const response = JSONBig.parse(JSONBig.stringify(responseTemp))

  if (!response?.result?.order?.lineItems) {
    throw new SquareApiError('no variation ID defined')
  }

  //return res.status(StatusCodes.CREATED).json({ msg })

  let hasError = false

  const orderItemsPromise = response.result.order.lineItems.map(
    async (item) => {
      if (!item?.catalogObjectId) {
        // throw new SquareApiError('no variation ID defined')
        hasError = true
        return res.status(StatusCodes.CREATED).json({ msg: 'ok' })
      }
      const itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
        item.catalogObjectId,
        false
      )

      if (responseTemp?.statusCode < 200 || responseTemp?.statusCode > 299) {
        hasError = true
        throw new SquareApiError('error while calling the Square API')
      }
      let vendorName =
        itemResponse.result.object.customAttributeValues.vendor_name.stringValue
      const user = await User.findOne({ name: vendorName })

      if (!user) {
        hasError = true
        throw new NotFoundError('user not found')
      }
      let variationName

      if (item.variationName !== '' && item.name === item.variationName) {
        variationName = ''
      } else {
        variationName = item.variationName
      }

      return {
        itemName: item.name,
        itemVariationName: variationName,
        itemVariationId: item.catalogObjectId,
        itemId: itemResponse.result.object.itemVariationData.itemId,
        quantity: item.quantity,
        basePrice: item.basePriceMoney.amount,
        totalDiscount: item.totalDiscountMoney.amount,
        totalMoney: item.totalMoney.amount,
        itemVendor: user._id,
      }
    }
  )
  const orderItems = await Promise.all(orderItemsPromise)

  // const customDate = day().month(9).date(1)

  const orderInfo = {
    orderId: req.body.data.id,
    location: response.result.order.locationId,
    orderDate: response.result.order.updatedAt,
    // orderDate: customDate.toDate(),
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
      const user = await User.findOne({ name: vendorName })

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
    orderItems: orderItems,
  }

  const newOrder = await Order.findByIdAndUpdate(existingOrder._id, orderInfo, {
    new: true,
  })

  return res.status(StatusCodes.OK).json({ newOrder })
}

export const inventoryUpdate = async (req, res) => {
  const counts = req.body.data.object['inventory_counts']
  console.log(counts)

  //copy below into agenda:
  const messageList = []
  for (let i = 0; i < counts.length; i++) {
    if ((counts[i]['catalog_object_type'] = 'ITEM_VARIATION')) {
      const catalogObjectId = counts[i]['catalog_object_id']
      console.log(catalogObjectId)

      const retrieveResponse =
        await squareClient.catalogApi.retrieveCatalogObject(
          catalogObjectId,
          false
        )

      const itemVendor =
        retrieveResponse.result.object.customAttributeValues['vendor_name']
          .stringValue
      const user = await User.findOne({ name: itemVendor })
      console.log(itemVendor)
      console.log(user)

      const locationInfo =
        retrieveResponse.result.object.itemVariationData.locationOverrides
      const relevantLocation = locationInfo.find((el) => {
        return el.locationId === counts[i]['location_id']
      })

      console.log(
        retrieveResponse.result.object.itemVariationData.locationOverrides
      )

      if (counts[i]['quantity'] <= 0) {
        let messageObj = messageList.find((el) => {
          return (el.name = itemVendor)
        })
        //warning email that item is out of stock
        console.log('quantity below zero')
      } else if (
        relevantLocation?.inventoryAlertThreshold &&
        counts[i]['quantity'] <=
          Number(relevantLocation?.inventoryAlertThreshold)
      ) {
        console.log('quantity below warning')
      }
    }
  }

  //copy above into agenda

  return res.status(StatusCodes.OK).json({ msg: 'ok' })
}
