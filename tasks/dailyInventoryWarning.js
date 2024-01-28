import mongoose from 'mongoose'
import { squareClient } from '../utils/squareUtils.js'
import User from '../models/UserModel.js'
import Location from '../models/LocationModel.js'
import day from 'dayjs'
import { transporter } from '../middleware/nodemailerMiddleware.js'
import dedent from 'dedent-js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'

try {
  await mongoose.connect(process.env.MONGO_URL)
  console.log('Mongoose connected, cron is running...')
  await dailyInventoryWarning()
  process.exit(0)
} catch (error) {
  console.log(error)
  process.exit(1)
}

async function dailyInventoryWarning() {
  //1. Get full list of vendors and loop through
  //2. Get full list of all products of that vendor
  //3. Get inventory counts of those products at each vendor active location. If any of those counts are below the threshold, save it to an array.

  const allVendors = await User.find(
    { role: 'user', active: true },
    { name: 1, email: 1, squareId: 1, locations: 1, settings: 1 }
  )

  const allPromises = []

  vendorLoop: for (let i = 0; i < allVendors.length; i++) {
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
      console.log(vendorProductResponse.result)
      cursor = vendorProductResponse.result?.cursor || null
      if (!products) {
        continue vendorLoop
      }
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

  await Promise.all(allPromises)

  console.log(
    `Daily inventory warning completed at ${day().format('MMM DD HH:mm')}`
  )

  return null
}

async function sendInventoryWarningEmail(
  vendorName,
  vendorEmail,
  warningDetails
) {
  const ALL_LOCATIONS = await Location.find()

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
