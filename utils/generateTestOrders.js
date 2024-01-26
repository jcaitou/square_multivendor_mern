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
// needed later:
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import day from 'dayjs'

const customerId = '4TSRAG6TZEH03AX4NW187DQE60' //always use the default test customer

const generateSpecificTestOrderInner = async (location, items, discount) => {
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

  return orderId
}

export const generateSpecificTestOrder = async (req, res, next) => {
  const { location, items, discount } = req.body
  res.locals.orderId = await generateSpecificTestOrderInner(
    location,
    items,
    discount
  )
  next()
}

const copyOrderInner = async (orderId) => {
  let response
  try {
    response = await squareClient.ordersApi.retrieveOrder(orderId)
  } catch (error) {
    console.log(error)
    throw new SquareApiError(
      error?.errors[0].detail || 'error while retrieving order'
    )
  }
  const retrievedOrder = response.result.order

  const existingOrder = await Order.findOne({ orderId: orderId })
  const currOrderVersion = retrievedOrder?.version || 0
  if (existingOrder && currOrderVersion == existingOrder.version) {
    //if existing order is there and version is the same then just skip it
    return res.status(StatusCodes.OK).json({ msg: 'ok' })
  }

  const orderItemsPromise = retrievedOrder.lineItems.map(async (item) => {
    if (!item?.catalogObjectId) {
      // throw new SquareApiError('no variation ID defined')
      hasError = true
      return res.status(StatusCodes.CREATED).json({ msg: 'ok' })
    }

    let itemResponse
    try {
      itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
        item.catalogObjectId,
        false
      )
    } catch (error) {
      console.log(error)
      throw new SquareApiError(
        error?.errors[0].detail || 'error while retrieving item'
      )
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
    orderId: retrievedOrder.id,
    location: retrievedOrder.locationId,
    orderDate: retrievedOrder.createdAt,
    version: retrievedOrder?.version || 0,
    orderItems: orderItems,
  }

  let newOrder
  if (existingOrder) {
    //find by ID and update
    newOrder = await Order.findByIdAndUpdate(retrievedOrder.id, orderInfo, {
      new: true,
    })
  } else {
    //create new order
    newOrder = await Order.create(orderInfo)
  }
  return newOrder
}

export const copyOrder = async (req, res) => {
  const orderId = res.locals.orderId
  const newOrder = await copyOrderInner(orderId)
  res.status(StatusCodes.OK).json({ newOrder })
}

export const generateRandomTestOrdersInner = async () => {
  //choose a location:
  const allLocations = await Location.find()
  let locationInd = getRandomInt(allLocations.length)
  let chosenLocation = allLocations[locationInd]._id

  //generate list of items:
  const allVendors = await User.find(
    { role: 'user', active: true },
    { name: 1, email: 1, squareId: 1, locations: 1, settings: 1 }
  )

  let items = []
  console.log(items)
  while (items.length === 0) {
    locationInd = getRandomInt(allLocations.length)
    chosenLocation = allLocations[locationInd]._id
    for (let i = 0; i < allVendors.length; i++) {
      let searchQuery = {
        limit: 100,
        customAttributeFilters: [
          {
            key: 'vendor_name',
            stringFilter: allVendors[i].name,
          },
        ],
      }

      let vendorProductResponse
      try {
        vendorProductResponse =
          await squareClient.catalogApi.searchCatalogItems(searchQuery)
      } catch (error) {
        console.log(searchQuery)
        throw new SquareApiError(
          error?.errors[0].detail ||
            'error while obtaining vendor catalog items'
        )
      }
      let products = vendorProductResponse.result.items

      const variationsData = products
        .map((product) => {
          return product.itemData.variations.map((variation) => {
            return {
              variationId: variation.id.toString(),
              presentAtLocationIds: product.presentAtLocationIds,
            }
          })
        })
        .flat()

      if (variationsData.length < 1) {
        continue
      }

      const itemInd = getRandomInt(variationsData.length)
      let chosenItem = variationsData[itemInd].variationId

      let inventoryResponse
      try {
        inventoryResponse =
          await squareClient.inventoryApi.retrieveInventoryCount(
            chosenItem,
            chosenLocation
          )
      } catch (error) {
        console.log(chosenItem, chosenLocation)
        throw new SquareApiError(
          error?.errors[0].detail || 'error while obtaining inventory'
        )
      }

      console.log(inventoryResponse.result.counts[0])

      if (
        variationsData[itemInd].presentAtLocationIds.includes(chosenLocation) &&
        Number(inventoryResponse.result.counts[0].quantity) > 0
      ) {
        items.push({
          quantity: '1',
          catalogObjectId: chosenItem,
        })
      }
    }
  }

  //choose whether to use discount or not
  const discount = Math.random() < 0.5

  if (items.length > 0) {
    const orderId = await generateSpecificTestOrderInner(
      chosenLocation,
      items,
      discount
    )
    await copyOrderInner(orderId)
  }

  console.log(`Random order generated at ${day().format('MMM DD HH:mm')}`)
  return 'random test order successfully created'
}

/* run once a day to generate random order including item from each vendor */
export const generateRandomTestOrders = async (req, res, next) => {
  const message = await generateRandomTestOrdersInner()
  return res.status(StatusCodes.OK).json({ msg: message })
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
