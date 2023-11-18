import { transporter } from '../../middleware/nodemailerMiddleware.js'
import { squareClient } from '../../utils/squareUtils.js'
import User from '../../models/UserModel.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import createCsvWriter from 'csv-writer'
import path from 'path'
import day from 'dayjs'
import { SquareApiError } from '../../errors/customError.js'
import { ALL_LOCATIONS, STORE_EMAIL } from '../../utils/constants.js'

export default (agenda) => {
  agenda.define('export all inventory', async function (job, done) {
    const userId = job.attrs.data.userId
    const squareName = job.attrs.data.squareName
    const locations = job.attrs.data.locations

    const user = await User.findOne({ _id: userId })

    let searchQuery = {
      limit: 100,
      customAttributeFilters: [
        {
          key: 'vendor_name',
          stringFilter: squareName,
        },
      ],
    }

    //start of API calls
    let response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
    if (!response) {
      throw new SquareApiError('error while calling the Square API')
    }
    let cursor = response.result.cursor

    let variationMapped = response.result.items
      .map((catalogItem) => {
        var variationList = catalogItem.itemData.variations.map(
          (variationList) => {
            return variationList.id
          }
        )
        return variationList
      })
      .flat()

    let inventoryResponse =
      await squareClient.inventoryApi.batchRetrieveInventoryCounts({
        catalogObjectIds: variationMapped,
        locationIds: locations,
      })

    if (!inventoryResponse) {
      throw new SquareApiError('error while obtaining inventory counts')
    }

    let organizedItems = response.result.items.map((catalogItem) => {
      var variationList = catalogItem.itemData.variations.map((variation) => {
        return {
          productName: catalogItem.itemData.name,
          productId: catalogItem.id,
          variationName: variation.itemVariationData.name,
          variationSku: variation.itemVariationData.sku,
          variationId: variation.id,
        }
      })
      return variationList
    })

    for (let i = 0; i < organizedItems.length; i++) {
      for (let j = 0; j < organizedItems[i].length; j++) {
        const variationInventory = inventoryResponse.result.counts.filter(
          (inventoryObj) => {
            return (
              inventoryObj.catalogObjectId == organizedItems[i][j].variationId
            )
          }
        )
        for (let k = 0; k < variationInventory.length; k++) {
          organizedItems[i][j][variationInventory[k].locationId] =
            variationInventory[k].quantity
        }
      }
    }
    organizedItems = organizedItems.flat()
    //end of API calls

    //write to csv initialization
    const date = day().format('YYYY-MM-DD')
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const resultFilepath = path.resolve(
      __dirname,
      '../../public/uploads',
      `${date}-${user.name}-inventory-export.csv`
    )

    let header = [
      { id: 'productName', title: 'Product Name' },
      { id: 'productId', title: 'Product ID' },
      { id: 'variationName', title: 'Variation Name' },
      { id: 'variationSku', title: 'Variation SKU' },
      { id: 'variationId', title: 'Variation ID' },
    ]

    for (let i = 0; i < locations.length; i++) {
      let currLocation = ALL_LOCATIONS.find((location) => {
        return location.id.toUpperCase() == locations[i].toUpperCase()
      })
      header.push({ id: locations[i], title: currLocation.name })
    }

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: resultFilepath,
      header: header,
    })
    //write to csv initialization - end

    //write to csv - loop
    for (let i = 0; i < organizedItems.length; i++) {
      let currRecord = {
        productName: organizedItems[i].productName,
        productId: organizedItems[i].productId,
        variationName: organizedItems[i].variationName,
        variationSku: organizedItems[i].variationSku.slice(5),
        variationId: organizedItems[i].variationId,
      }
      for (let j = 0; j < locations.length; j++) {
        currRecord[locations[j]] = organizedItems[i][locations[j]]
      }
      await csvWriter.writeRecords([currRecord])
    }
    //write to csv - loop - end

    while (cursor != '') {
      searchQuery.cursor = cursor

      //start of API calls
      response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
      if (!response) {
        throw new SquareApiError('error while calling the Square API')
      }
      cursor = response.result.cursor

      variationMapped = response.result.items
        .map((catalogItem) => {
          var variationList = catalogItem.itemData.variations.map(
            (variationList) => {
              return variationList.id
            }
          )
          return variationList
        })
        .flat()

      inventoryResponse =
        await squareClient.inventoryApi.batchRetrieveInventoryCounts({
          catalogObjectIds: variationMapped,
          locationIds: locations,
        })

      if (!inventoryResponse) {
        throw new SquareApiError('error while obtaining inventory counts')
      }

      organizedItems = response.result.items.map((catalogItem) => {
        var variationList = catalogItem.itemData.variations.map((variation) => {
          return {
            productName: catalogItem.itemData.name,
            productId: catalogItem.id,
            variationName: variation.itemVariationData.name,
            variationSku: variation.itemVariationData.sku,
            variationId: variation.id,
          }
        })
        return variationList
      })

      for (let i = 0; i < organizedItems.length; i++) {
        for (let j = 0; j < organizedItems[i].length; j++) {
          const variationInventory = inventoryResponse.result.counts.filter(
            (inventoryObj) => {
              return (
                inventoryObj.catalogObjectId == organizedItems[i][j].variationId
              )
            }
          )
          for (let k = 0; k < variationInventory.length; k++) {
            organizedItems[i][j][variationInventory[k].locationId] =
              variationInventory[k].quantity
          }
        }
      }
      organizedItems = organizedItems.flat()
      //end of API calls

      //write to csv - loop
      for (let i = 0; i < organizedItems.length; i++) {
        let currRecord = {
          productName: organizedItems[i].productName,
          productId: organizedItems[i].productId,
          variationName: organizedItems[i].variationName,
          variationSku: organizedItems[i].variationSku.slice(5),
          variationId: organizedItems[i].variationId,
        }
        for (let j = 0; j < locations.length; j++) {
          currRecord[locations[j]] = organizedItems[i][locations[j]]
        }
        await csvWriter.writeRecords([currRecord])
      }
      //write to csv - loop - end
    }

    let attachments = [
      {
        filename: `${date}-inventory-export.csv`,
        path: resultFilepath,
      },
    ]

    let message = {
      from: STORE_EMAIL,
      to: user.email,
      subject: 'Inventory Export',
      text: 'Your requested inventory have finished exporting.',
      attachments: attachments,
    }
    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err)
      } else {
        //console.log(info)
      }
    })
    done()
  })
}
