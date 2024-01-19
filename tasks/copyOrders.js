import cron from 'node-cron'
import mongoose from 'mongoose'
import { squareClient } from '../utils/squareUtils.js'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import Location from '../models/LocationModel.js'
import day from 'dayjs'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'

//the following is for when you upload to render:
// try {
//   await mongoose.connect(process.env.MONGO_URL)
//   console.log('Mongoose connected, cron is running...')
//   await copyOrders()
//   process.exit(0)
// } catch (error) {
//   console.log(error)
//   process.exit(1)
// }

export const copyOrders = async () => {
  const ALL_LOCATIONS = await Location.find()

  const startDate = day().subtract(1, 'day')

  const locationIds = ALL_LOCATIONS.map((el) => {
    return el._id
  })

  let cursor = 'initial'

  const ordersQuery = {
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
  }

  while (cursor != null) {
    if (cursor !== 'initial') {
      ordersQuery.cursor = cursor
    }
    let searchOrders
    try {
      searchOrders = await squareClient.ordersApi.searchOrders(ordersQuery)
    } catch (error) {
      console.log(ordersQuery)
      throw new SquareApiError(
        error?.errors[0].detail || 'error while searching orders'
      )
    }

    const allOrders = searchOrders.result.orders || []
    cursor = searchOrders.result?.cursor || null

    for (let i = 0; i < allOrders.length; i++) {
      const existingOrder = await Order.findOne({
        orderId: allOrders[i].id,
      })

      const currOrderVersion = allOrders[i]?.version || 0
      if (existingOrder && currOrderVersion == existingOrder.version) {
        //if existing order is there and version is the same then just skip it
        continue
      }

      let userWithoutPassword
      const orderItemsPromise = allOrders[i].lineItems.map(async (item) => {
        if (!item?.catalogObjectId) {
          hasError = true
          throw new SquareApiError('no variation ID defined')
        }
        let itemResponse
        try {
          itemResponse = await squareClient.catalogApi.retrieveCatalogObject(
            item.catalogObjectId,
            false
          )
        } catch (error) {
          console.log(item)
          throw new SquareApiError(
            error?.errors[0].detail || 'error while searching item'
          )
        }

        let vendorName =
          itemResponse.result.object.customAttributeValues.vendor_name
            .stringValue
        const user = await User.findOne({ name: vendorName })
        userWithoutPassword = user.toJSON()

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
        console.log('existing order, find by ID and update')
        newOrder = await Order.findByIdAndUpdate(existingOrder._id, orderInfo, {
          new: true,
        })
      } else {
        //create new order
        newOrder = await Order.create(orderInfo)
      }
    }
  }

  console.log(`Copy Orders completed at ${day().format('MMM DD HH:mm')}`)

  return null
}
