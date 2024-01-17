import { squareClient } from '../utils/squareUtils.js'
import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import JSONBig from 'json-bigint'
import Location from '../models/LocationModel.js'

const customerId = '4TSRAG6TZEH03AX4NW187DQE60' //always use the default test customer

export const generateSpecificTestOrder = async (req, res) => {
  const { location, items, discount } = req.body
  const lineItems = items.map((el) => {
    return {
      ...el,
      itemType: 'ITEM',
    }
  })

  const order = {
    locationId: location,
    customerId: customerId, //always the default test customer
    lineItems: lineItems,
    serviceCharges: [
      {
        uid: 'marketplace-fee',
        name: 'Marketplace Fee',
        percentage: '13',
        calculationPhase: 'TOTAL_PHASE',
        // taxable: false,
        scope: 'ORDER',
      },
    ],
  }

  if (discount) {
    order.discounts = [
      {
        name: '10% Off',
        percentage: '10',
        scope: 'ORDER',
      },
    ]
  }
  console.log(location, order)
  let orderResponse
  //calculateOrder / createOrder
  try {
    orderResponse = await squareClient.ordersApi.createOrder({
      order: order,
    })
  } catch (error) {
    console.log(error)
    throw new SquareApiError(
      error?.errors[0].detail || 'error while creating order'
    )
  }

  const orderId = orderResponse.result.order.id
  let netAmountDue = Number(orderResponse.result.order.netAmountDueMoney.amount)

  console.log(netAmountDue)

  switch (netAmountDue % 5) {
    case 1:
    case 2:
    case 6:
    case 7:
      netAmountDue = Math.floor(netAmountDue / 5) * 5
      break
    case 3:
    case 4:
    case 8:
    case 9:
      netAmountDue = Math.floor(netAmountDue / 5 + 1) * 5
      break
  }

  const parsedResponse = JSONBig.parse(
    JSONBig.stringify(orderResponse.result.order)
  )

  console.log(netAmountDue)
  console.log(orderId)

  // create payment and pay the order
  try {
    await squareClient.paymentsApi.createPayment({
      sourceId: 'CASH',
      idempotencyKey: nanoid(),
      amountMoney: {
        amount: netAmountDue,
        currency: 'CAD',
      },
      orderId: orderId,
      customerId: customerId, //always the default test customer
      locationId: location,
      cashDetails: {
        buyerSuppliedMoney: {
          amount: netAmountDue,
          currency: 'CAD',
        },
      },
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while paying order'
    )
  }

  res.status(StatusCodes.OK).json({ parsedResponse })
}

export const generateTestOrders = async (req, res) => {
  const allLocations = await Location.find()
  let locationInd = getRandomInt(allLocations.length)
  let chosenLocation = allLocations[locationInd]._id

  const numOfProducts = getRandomInt(5)

  const lineItems = []

  for (let i = 0; i <= numOfProducts; i++) {
    let itemInd = getRandomInt(productVariations.length)
    lineItems.push({
      quantity: '1',
      catalogObjectId: productVariations[itemInd],
      itemType: 'ITEM',
    })
  }
  console.log(chosenLocation, lineItems)
  return res.status(StatusCodes.OK).json({ msg: 'ok' })

  try {
    const orderResponse = await squareClient.ordersApi.createOrder({
      order: {
        locationId: chosenLocation,
        customerId: customerId, //always the default test customer
        lineItems: lineItems,
      },
    })

    const orderId = orderResponse.result.order.id
    const netAmountDue = orderResponse.result.order.netAmountDueMoney.amount

    const parsedResponse = JSONBig.parse(
      JSONBig.stringify(orderResponse.result.order)
    )

    // create payment and pay the order
    try {
      const response = await squareClient.paymentsApi.createPayment({
        sourceId: 'CASH',
        idempotencyKey: nanoid(),
        amountMoney: {
          amount: netAmountDue,
          currency: 'CAD',
        },
        orderId: orderId,
        customerId: 'R0WM5P8MTP3SCHVQZM4FVEC970', //always the default test customer
        locationId: chosenLocation,
        cashDetails: {
          buyerSuppliedMoney: {
            amount: netAmountDue,
            currency: 'CAD',
          },
        },
      })

      // console.log(response.result)
      res.status(StatusCodes.OK).json({ parsedResponse })
    } catch (error) {
      console.log(error)
    }

    // res.status(StatusCodes.OK).json({ parsedResponse })
  } catch (error) {
    console.log(error)
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// needed later:
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import day from 'dayjs'

export const copyOrders = async (req, res) => {
  const allLocations = await Location.find()
  const startDate = day().subtract(2, 'day')
  // const oldOrders = await Order.find({
  //   updatedAt: { $gte: startDate.toDate() },
  // }).sort('-updatedAt')
  // return res.status(StatusCodes.OK).json({ oldOrders })

  const locationIds = allLocations.map((el) => {
    return el._id
  })

  const searchOrders = await squareClient.ordersApi.searchOrders({
    locationIds: locationIds,
    query: {
      filter: {
        stateFilter: {
          states: ['COMPLETED'],
        },
        dateTimeFilter: {
          updatedAt: {
            startAt: startDate.format('YYYY-MM-DD'),
          },
        },
      },
      sort: {
        sortField: 'UPDATED_AT',
        sortOrder: 'ASC',
      },
    },
  })

  if (!searchOrders) {
    throw new SquareApiError('error while calling the Square API')
  }

  const allOrders = searchOrders.result.orders

  for (let i = 0; i < allOrders.length; i++) {
    const existingOrder = await Order.findOne({ orderId: allOrders[i].id })
    const currOrderVersion = allOrders[i]?.version || 0
    if (existingOrder && currOrderVersion == existingOrder.version) {
      //if existing order is there and version is the same then just skip it
      continue
    }

    const orderItemsPromise = allOrders[i].lineItems.map(async (item) => {
      if (!item?.catalogObjectId) {
        // throw new SquareApiError('no variation ID defined')
        hasError = true
        return res.status(StatusCodes.CREATED).json({ msg: 'ok' })
      }
      const itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
        item.catalogObjectId,
        false
      )

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
        itemSku: itemResponse.result.object.itemVariationData.sku,
        quantity: item.quantity,
        basePrice: Number(item.basePriceMoney.amount),
        totalDiscount: Number(item.totalDiscountMoney.amount),
        totalMoney: Number(
          item.totalMoney.amount - item.totalServiceChargeMoney.amount
        ),
        itemVendor: user._id,
      }
    })
    const orderItems = await Promise.all(orderItemsPromise)
    const orderInfo = {
      orderId: allOrders[i].id,
      location: allOrders[i].locationId,
      orderDate: allOrders[i].createdAt,
      version: allOrders[i]?.version || 0,
      orderItems: orderItems,
    }

    let newOrder
    if (existingOrder) {
      //find by ID and update
      newOrder = await Order.findByIdAndUpdate(allOrders[i].id, orderInfo, {
        new: true,
      })
    } else {
      //create new order
      newOrder = await Order.create(orderInfo)
    }
  }

  const parsedResponse = JSONBig.parse(JSONBig.stringify(searchOrders.result))
  // console.log(searchOrders.result)
  res.status(StatusCodes.OK).json({ msg: 'ok' })
}
