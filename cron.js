import cron from 'node-cron'
import mongoose from 'mongoose'
import { squareClient } from './utils/squareUtils.js'
// import { ALL_LOCATIONS } from './utils/constants.js'
import Order from './models/OrderModel.js'
import User from './models/UserModel.js'
import Location from './models/LocationModel.js'
import day from 'dayjs'
import { transporter } from './middleware/nodemailerMiddleware.js'
import dedent from 'dedent-js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from './errors/customError.js'
import * as dotenv from 'dotenv'
dotenv.config()

let ALL_LOCATIONS

console.log(process.cwd())
try {
  await mongoose.connect(process.env.MONGO_URL)
  console.log('Mongoose connected, cron is running...')
  ALL_LOCATIONS = await Location.find()
} catch (error) {
  console.log(error)
  process.exit(1)
}

// cron.schedule('0 1 * * *', () => {
//   copyOrders()
// })

// copyOrders()
// await dailyInventoryWarning()
process.exit(0)

async function copyOrders() {
  console.log(`Copy Orders ran at ${day().format('MMM DD HH:mm')}`)

  let warningObjArray = []

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
    // const searchOrders = await squareClient.ordersApi.searchOrders(ordersQuery)
    // if (!searchOrders) {
    //   return null
    // }

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
        // const itemResponse =
        //   await squareClient.catalogApi.retrieveCatalogObject(
        //     item.catalogObjectId,
        //     false
        //   )

        let vendorName =
          itemResponse.result.object.customAttributeValues.vendor_name
            .stringValue
        const user = await User.findOne({ name: vendorName })
        userWithoutPassword = user.toJSON()

        if (!user) {
          hasError = true
          throw new NotFoundError('user not found')
        }
        // below is for sending inventory warnings
        const locationInfo =
          itemResponse.result.object.itemVariationData.locationOverrides
        //above is for sending inventory warnings

        let variationName
        if (item.variationName !== '' && item.name === item.variationName) {
          variationName = ''
        } else {
          variationName = item.variationName
        }

        return {
          orderItemInfo: {
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
          },
          locationInfo: locationInfo,
          user,
        }
      })

      const orderItems = await Promise.all(orderItemsPromise)

      const orderInfo = {
        orderId: allOrders[i].id,
        location: allOrders[i].locationId,
        orderDate: allOrders[i].createdAt,
        version: allOrders[i]?.version || 0,
        orderItems: orderItems.map((el) => el.orderItemInfo),
      }

      // below is for sending inventory warnings
      warningObjArray = await inventoryWarning(
        orderItems,
        allOrders[i].locationId,
        warningObjArray
      )
      //above is for sending inventory warnings

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

  // if (warningObjArray.length > 0) {
  //   //run a function to send emails
  //   sendInventoryWarningEmails(warningObjArray)
  // }
  return null
}

async function dailyInventoryWarning() {
  //1. Get full list of vendors and loop through
  //2. Get full list of all products of that vendor
  //3. Get inventory counts of those products at each vendor active location. If any of those counts are below the threshold, save it to an array.

  console.log(`Daily inventory warning ran at ${day().format('MMM DD HH:mm')}`)

  const allVendors = await User.find(
    { role: 'user', active: true },
    { name: 1, email: 1, squareId: 1, locations: 1, settings: 1 }
  )

  const allPromises = []

  for (let i = 0; i < allVendors.length; i++) {
    if (allVendors[i].settings.receiveInventoryWarningEmails === false) {
      continue
    }

    let inventoryWarnings = []

    let searchQuery = {
      limit: 100,
      customAttributeFilters: [
        {
          key: 'vendor_name',
          stringFilter: allVendors[i].name,
        },
      ],
    }

    let cursor = 'initial'

    while (cursor != null) {
      if (cursor !== 'initial') {
        searchQuery.cursor = cursor
      }

      let vendorProductResponse
      try {
        vendorProductResponse =
          await squareClient.catalogApi.searchCatalogItems(searchQuery)
      } catch (error) {
        console.log(searchQuery)
        throw new SquareApiError(
          error?.errors[0].detail || 'error while obtaining inventory'
        )
      }
      let products = vendorProductResponse.result.items
      cursor = vendorProductResponse.result?.cursor || null
      let variationsData = products
        .map((product) => {
          return product.itemData.variations.map((variation) => {
            return {
              productName: product.itemData.name,
              variationName: variation.itemVariationData.name,
              variationSku: variation.itemVariationData.sku,
              productId: variation.itemVariationData.itemId.toString(),
              variationId: variation.id.toString(),
              locationOverrides: variation.itemVariationData.locationOverrides,
            }
          })
        })
        .flat()

      for (let j = 0; j < variationsData.length; j++) {
        for (let k = 0; k < allVendors[i].locations.length; k++) {
          let inventoryCountResponse
          try {
            inventoryCountResponse =
              await squareClient.inventoryApi.retrieveInventoryCount(
                variationsData[j].variationId,
                allVendors[i].locations[k]
              )
          } catch (error) {
            console.log(
              variationsData[j].variationId,
              allVendors[i].locations[k]
            )
            throw new SquareApiError(
              error?.errors[0].detail || 'error while obtaining inventory'
            )
          }
          const inventoryCount = inventoryCountResponse.result.counts[0]

          const relevantLocation = variationsData[j].locationOverrides.find(
            (el) => {
              return el.locationId === allVendors[i].locations[k]
            }
          )

          let warningType
          if (Number(inventoryCount.quantity) <= 0) {
            warningType = 'OUT OF STOCK'
          } else if (
            relevantLocation?.inventoryAlertThreshold &&
            Number(inventoryCount.quantity) ===
              Number(relevantLocation?.inventoryAlertThreshold)
          ) {
            warningType = 'LOW STOCK'
          } else {
            //if neither warning is triggered, just go to the next item
            continue
          }
          const itemName = variationsData[j].productName
          const variationName = variationsData[j].variationName
          const productName =
            variationName == ''
              ? itemName
              : itemName === variationName
              ? itemName
              : `${itemName} (${variationName})`
          inventoryWarnings.push({
            productName: productName,
            location: allVendors[i].locations[k],
            itemSku: variationsData[j].variationSku.slice(5),
            quantity: Number(inventoryCount.quantity),
            warningType: warningType,
          })
        }
      }
    }

    if (
      inventoryWarnings.length > 0 &&
      allVendors[i].email != 'beelu.illustration@gmail.com'
    ) {
      allPromises.push(
        sendInventoryWarningEmail(
          allVendors[i].name,
          allVendors[i].email,
          inventoryWarnings
        )
      )
    }
  }

  console.log(allPromises)
  await Promise.all(allPromises)

  return null
}

async function inventoryWarning(orderItems, locationId, warningObjArray = []) {
  const lineItemIds = orderItems.map(
    (item) => item.orderItemInfo.itemVariationId
  )

  for (let i = 0; i < orderItems.length; i++) {
    if (orderItems[i].user.settings.receiveInventoryWarningEmails === false) {
      // console.log('skipped')
      continue
    }
    const relevantLocation = orderItems[i].locationInfo.find((el) => {
      return el.locationId === locationId
    })

    const inventoryCountResponse =
      await squareClient.inventoryApi.retrieveInventoryCount(
        orderItems[i].orderItemInfo.itemVariationId,
        locationId
      )

    if (!inventoryCountResponse) {
      console.log('could not retrieve inventory counts')
      continue
    }

    const inventoryCount = inventoryCountResponse.result.counts[0]
    //it is only zero index if there is only ONE location being searched

    const itemName = orderItems[i].orderItemInfo.itemName
    const variationName = orderItems[i].orderItemInfo.itemVariationName
    const productName =
      variationName == ''
        ? itemName
        : itemName === variationName
        ? itemName
        : `${itemName} (${variationName})`

    let warningObj = {
      vendorName: orderItems[i].user.name,
      vendorEmail: orderItems[i].user.email,
      warningDetails: [
        {
          productName: productName,
          location: locationId,
          itemSku: orderItems[i].orderItemInfo.itemSku.slice(5),
          quantity: Number(inventoryCount.quantity),
          warningType: '',
        },
      ],
    }

    if (Number(inventoryCount.quantity) <= 0) {
      warningObj.warningDetails[0].warningType = 'OUT OF STOCK'
    } else if (
      relevantLocation?.inventoryAlertThreshold &&
      Number(inventoryCount.quantity) ===
        Number(relevantLocation?.inventoryAlertThreshold)
    ) {
      warningObj.warningDetails[0].warningType = 'LOW STOCK'
    } else {
      //if neither warning is triggered, just go to the next item
      continue
    }
    const index = warningObjArray.findIndex((el) => {
      return el.vendorEmail == warningObj.vendorEmail
    })
    if (index < 0) {
      warningObjArray.push(warningObj)
    } else {
      let newWarningDetailsArray = warningObjArray[index].warningDetails.filter(
        (el) => {
          return el.itemSku != warningObj.warningDetails[0].itemSku
        }
      )
      newWarningDetailsArray.push(warningObj.warningDetails[0])
      warningObjArray[index].warningDetails = newWarningDetailsArray
    }
  }

  return warningObjArray
}

async function sendInventoryWarningEmail(
  vendorName,
  vendorEmail,
  warningDetails
) {
  let htmlTable = ''
  let textBody = ''
  for (let i = 0; i < warningDetails.length; i++) {
    const locationName = ALL_LOCATIONS.find((el) => {
      return el._id === warningDetails[i].location
    }).name
    htmlTable =
      htmlTable +
      dedent`
        <tr>
         <td>${warningDetails[i].productName}</td>
         <td>${locationName}</td>
         <td>${warningDetails[i].itemSku}</td>
         <td>${warningDetails[i].quantity}</td>
         <td>${warningDetails[i].warningType}</td>
        </tr>
        `
    textBody =
      textBody +
      dedent`
        Item: ${warningDetails[i].productName}
        Location: ${locationName}
        SKU: ${warningDetails[i].itemSku}
        Quantity: ${warningDetails[i].quantity}
        Warning: ${warningDetails[i].warningType}
       `
  }

  let message = {
    from: 'mailtrap@jcdevs.site',
    to: vendorEmail,
    subject: 'Inventory Warning',
    text: dedent`
       Dear ${vendorName},

       A low-stock warning has just been triggered for the following ${
         warningDetails.length > 1 ? 'items' : 'item'
       }:
       ${textBody}

       Makers2
       `,
    html: dedent`
       <p>Dear ${vendorName},</p>
       <p>A low-stock warning has just been triggered for the following ${
         warningDetails.length > 1 ? 'items' : 'item'
       }:</p>
       <table>
        <tr>
          <th>Item</th>
          <th>Location</th>
          <th>SKU</th>
          <th>Quantity Remaining</th>
          <th>Warning</th>
        </tr>
        ${htmlTable}
       </table>

       <p>Makers2</p>
       `,
  }

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err)
      return
    } else {
      return
    }
  })
}
