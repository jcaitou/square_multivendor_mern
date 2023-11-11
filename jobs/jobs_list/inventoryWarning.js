import { transporter } from '../../middleware/nodemailerMiddleware.js'
import User from '../../models/UserModel.js'
import { squareClient } from '../../utils/squareUtils.js'
import { ALL_LOCATIONS } from '../../utils/constants.js'
import dedent from 'dedent-js'

export default (agenda) => {
  agenda.define('inventory warning', async function (job, done) {
    const { counts } = job.attrs.data

    //copy below into agenda:
    for (let i = 0; i < counts.length; i++) {
      if ((counts[i]['catalog_object_type'] = 'ITEM_VARIATION')) {
        const catalogObjectId = counts[i]['catalog_object_id']

        const retrieveResponse =
          await squareClient.catalogApi.retrieveCatalogObject(
            catalogObjectId,
            false
          )

        const itemVendor =
          retrieveResponse.result.object.customAttributeValues['vendor_name']
            .stringValue
        const user = await User.findOne({ name: itemVendor })

        const itemId = retrieveResponse.result.object.itemVariationData.itemId

        const itemRetrieveResponse =
          await squareClient.catalogApi.retrieveCatalogObject(itemId, false)

        const itemName = itemRetrieveResponse.result.object.itemData.name
        const itemSku = retrieveResponse.result.object.itemVariationData.sku
        const variationName =
          retrieveResponse.result.object.itemVariationData.name
        const productName =
          itemName === variationName
            ? itemName
            : `${itemName} (${variationName})`

        const locationInfo =
          retrieveResponse.result.object.itemVariationData.locationOverrides
        const relevantLocation = locationInfo.find((el) => {
          return el.locationId === counts[i]['location_id']
        })

        const locationName = ALL_LOCATIONS.find((el) => {
          return el.id === counts[i]['location_id']
        }).name

        if (counts[i]['quantity'] == 0) {
          //warning email that item is out of stock
          let message = {
            from: 'makers2@email.com',
            to: user.email,
            subject: 'Out of Stock Warning',
            text: dedent`
          Dear ${user.name},

          An out-of-stock warning has just been triggered for the following item:
          Item: ${productName}
          Location: ${locationName}
          SKU: ${itemSku}
          Quantity: 0

          Makers2
          `,
          }

          transporter.sendMail(message, (err, info) => {
            if (err) {
              console.log(err)
            }
          })
        } else if (
          relevantLocation?.inventoryAlertThreshold &&
          counts[i]['quantity'] ==
            Number(relevantLocation?.inventoryAlertThreshold)
        ) {
          //warning email for low stock
          let message = {
            from: 'makers2@email.com',
            to: user.email,
            subject: 'Low Stock Warning',
            text: dedent`
          Dear ${user.name},

          A low-stock warning has just been triggered for the following item:
          Item: ${productName}
          Location: ${locationName}
          SKU: ${itemSku}
          Quantity: ${counts[i]['quantity']}

          Makers2
          `,
          }

          transporter.sendMail(message, (err, info) => {
            if (err) {
              console.log(err)
            }
          })
        }
      }
    }
    //copy above into agenda

    done()
  })
}
