import { squareClient } from '../../utils/squareUtils.js'
import Order from '../../models/OrderModel.js'
import User from '../../models/UserModel.js'
import Location from '../../models/LocationModel.js'
import day from 'dayjs'

export default (agenda) => {
  agenda.define('copy orders', async function (job, done) {
    // your code goes here
    const data = job.attrs.data

    console.log('started')

    const startDate = day().subtract(2, 'day')
    console.log(startDate)
    // const oldOrders = await Order.find({
    //   updatedAt: { $gte: startDate.toDate() },
    // }).sort('-updatedAt')
    // return res.status(StatusCodes.OK).json({ oldOrders })

    const allLocations = await Location.find()
    const locationIds = allLocations.map((el) => {
      return el._id
    })

    let cursor = 'initial'

    while (cursor != null) {
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
      cursor = searchOrders.result?.cursor || null
      console.log(cursor)

      for (let i = 0; i < allOrders.length; i++) {
        const existingOrder = await Order.findOne({ orderId: allOrders[i].id })
        const currOrderVersion = allOrders[i]?.version || 0
        if (existingOrder && currOrderVersion == existingOrder.version) {
          //if existing order is there and version is the same then just skip it
          continue
        }

        //below is for sending inventory warnings
        const lineItemIds = allOrders[i].lineItems.map(
          (item) => item.catalogObjectId
        )
        agenda.schedule('2 minutes from now', 'inventory warning', {
          lineItemIds,
          locationIds: [allOrders[i].locationId],
        })
        //above is for sending inventory warnings

        const orderItemsPromise = allOrders[i].lineItems.map(async (item) => {
          if (!item?.catalogObjectId) {
            // throw new SquareApiError('no variation ID defined')
            hasError = true
            return res.status(StatusCodes.CREATED).json({ msg: 'ok' })
          }
          const itemResponse =
            await squareClient.catalogApi.retrieveCatalogObject(
              item.catalogObjectId,
              false
            )

          let vendorName =
            itemResponse.result.object.customAttributeValues.vendor_name
              .stringValue
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
    }
    done()
  })
}
