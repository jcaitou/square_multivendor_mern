import { nanoid } from 'nanoid'
import { squareClient } from '../../utils/squareUtils.js'
import { FILE_UPLOAD_STATUS } from '../../utils/constants.js'
import FileAction from '../../models/FileActionModel.js'
import csv from 'csvtojson'
import createCsvWriter from 'csv-writer'
import * as fs from 'fs'
import { finished } from 'stream/promises'
import { Readable } from 'stream'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import cloudinary from 'cloudinary'

export default (agenda) => {
  agenda.define('product import', async function (job, done) {
    // your code goes here
    const {
      squareName,
      squareId,
      skuId,
      locations: vendorLocations,
      filename: fileName,
      fileUrl,
      fileActionId,
      defaultInventoryWarningLevel,
    } = job.attrs.data

    let processedIds = [''],
      organizedProducts = []
    let hasError = false

    const __dirname = dirname(fileURLToPath(import.meta.url))
    const filepath = path.resolve(__dirname, '../../public/uploads', fileName)
    const resultFilepath = path.resolve(
      __dirname,
      '../../public/uploads',
      `Result-${fileName}`
    )

    if (fs.existsSync(filepath)) {
      console.log('file exists')
      // ...
    } else {
      const response = await fetch(fileUrl)
      const fileStream = fs.createWriteStream(filepath, { flags: 'wx' })
      await finished(Readable.fromWeb(response.body).pipe(fileStream))
    }

    const productUpdateData = await csv().fromFile(filepath)

    if (productUpdateData == null) {
      //error
      console.log('file exists but error reading data')
      return
    }

    const userSku = skuId.toString(16).padStart(4, '0')
    const locationOverrides = vendorLocations.map((location) => {
      return {
        locationId: location,
        trackInventory: true,
        inventoryAlertType: 'LOW_QUANTITY',
        inventoryAlertThreshold: defaultInventoryWarningLevel,
      }
    })

    for (let i = 0; i < productUpdateData.length; i++) {
      if (productUpdateData[i].productId) {
        //this is an existing product
        if (!processedIds.includes(productUpdateData[i].productId)) {
          processedIds.push(productUpdateData[i].productId)
          let currProduct = productUpdateData.filter((row) => {
            return productUpdateData[i].productId == row.productId
          })
          organizedProducts.push(currProduct)
        }
      } else {
        //this is a new product and product name is not empty
        if (!processedIds.includes(productUpdateData[i].productName)) {
          processedIds.push(productUpdateData[i].productName)
          let currProduct = productUpdateData.filter((row) => {
            return productUpdateData[i].productName == row.productName
          })
          organizedProducts.push(currProduct)
        }
      }
    }

    //const resultsFile = `./uploads/${fileName.replace('Import-', 'Results-')}`
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: resultFilepath,
      header: [
        { id: 'productName', title: 'productName' },
        { id: 'variationName', title: 'variationName' },
        { id: 'variationSku', title: 'variationSku' },
        { id: 'variationPrice', title: 'variationPrice' },
        { id: 'productId', title: 'productId' },
        { id: 'variationId', title: 'variationId' },
        { id: 'status', title: 'status' },
        { id: 'message', title: 'message' },
      ],
    })

    let resultsJSON = []
    productLoop: for (let i = 0; i < organizedProducts.length; i++) {
      let response = null
      let statusOK = true
      let message = ''

      if (organizedProducts[i][0].productId) {
        //this is an existing product
        let currProductResponse
        try {
          currProductResponse =
            await squareClient.catalogApi.retrieveCatalogObject(
              organizedProducts[i][0].productId,
              false
            )
        } catch (error) {
          hasError = true
          for (let j = 0; j < organizedProducts[i].length; j++) {
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'Failed',
              message: 'ID does not match any existing product',
            })
          }

          console.log('ID does not match any existing product')
          continue productLoop
        }

        let itemVendor =
          currProductResponse.result.object.customAttributeValues['vendor_name']
            .stringValue

        if (itemVendor != squareName) {
          hasError = true
          for (let j = 0; j < organizedProducts[i].length; j++) {
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'Failed',
              message: 'Not authorized to edit this product',
            })
          }
          console.log('Not authorized to edit this product')
          continue productLoop
        }

        let currProductObject = currProductResponse.result
        let currProductVariations = currProductObject.object.itemData.variations

        if (organizedProducts[i][0].productName != '') {
          currProductObject.object.itemData.name =
            organizedProducts[i][0].productName
        }

        for (let j = 0; j < organizedProducts[i].length; j++) {
          let price = parseInt(organizedProducts[i][j].variationPrice * 100)
          if (!Number.isInteger(price)) {
            hasError = true
            for (let j = 0; j < organizedProducts[i].length; j++) {
              resultsJSON.push({
                ...organizedProducts[i][j],
                status: 'Failed',
                message: 'Price needs to be a number',
              })
            }
            console.log('not an int')
            continue productLoop
          } else {
            organizedProducts[i][j].variationPrice = price
          }

          let variationIndex = currProductVariations.findIndex((variation) => {
            return variation.id == organizedProducts[i][j].variationId
          })
          if (variationIndex >= 0) {
            //variation ID exists, edit the existing one
            currProductVariations[variationIndex].itemVariationData.name =
              organizedProducts[i][j].variationName
            currProductVariations[variationIndex].itemVariationData.sku =
              organizedProducts[i][j].variationSku
            currProductVariations[
              variationIndex
            ].itemVariationData.priceMoney.amount = price
          } else {
            //create a new variation
            let variationSku
            if (organizedProducts[i][j].variationSku) {
              variationSku = organizedProducts[i][j].variationSku.substring(
                0,
                25
              )
            } else {
              variationSku = organizedProducts[i][j].variationName
                .substring(0, 25)
                .replace(/\s/g, '')
            }
            let newVariation = {
              type: 'ITEM_VARIATION',
              id: `#product${i}_variation${j}`,
              itemVariationData: {
                itemId: organizedProducts[i][j].productId,
                name: organizedProducts[i][j].variationName,
                sku: `${userSku}-${variationSku}`,
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: organizedProducts[i][j].variationPrice || 0,
                  currency: 'CAD',
                },
                presentAtAllLocations: false,
                presentAtLocationIds: vendorLocations,
                trackInventory: true,
                availableForBooking: false,
                stockable: true,
              },
              customAttributeValues: {
                vendor_name: {
                  stringValue: squareName,
                },
              },
            }

            if (defaultInventoryWarningLevel > 0) {
              newVariation.itemVariationData.locationOverrides =
                locationOverrides
            }

            organizedProducts[i][j].variationId = `#product${i}_variation${j}`
            currProductVariations.push(newVariation)
          }

          currProductObject.object.itemData.variations = currProductVariations
        }

        //upsert the entire object
        try {
          response = await squareClient.catalogApi.upsertCatalogObject({
            idempotencyKey: nanoid(),
            object: currProductObject.object,
          })
        } catch (error) {
          hasError = true
          for (let j = 0; j < organizedProducts[i].length; j++) {
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'Failed',
              message: 'Error calling Square API',
            })
          }
          console.log(error)
          continue productLoop
        }

        //everything above this line is for existing products
      } else {
        //this is an entirely new product

        for (let j = 0; j < organizedProducts[i].length; j++) {
          let price = parseInt(organizedProducts[i][j].variationPrice * 100)
          if (!Number.isInteger(price)) {
            hasError = true
            for (let j = 0; j < organizedProducts[i].length; j++) {
              resultsJSON.push({
                ...organizedProducts[i][j],
                status: 'Failed',
                message: 'Price needs to be a number',
              })
            }
            console.log('not an int')
            continue productLoop
          } else {
            organizedProducts[i][j].variationPrice = price
          }
          organizedProducts[i][j].productId = `#new_product${i}`
          organizedProducts[i][j].variationId = `#product${i}_variation${j}`
        }

        let newProductVariations = organizedProducts[i].map(
          (variation, index) => {
            let variationSku
            if (variation.variationSku) {
              variationSku = variation.variationSku.substring(0, 25)
            } else if (variation.variationName) {
              variationSku = variation.variationName
                .substring(0, 25)
                .replace(/\s/g, '')
            } else {
              variationSku = variation.productName
                .substring(0, 25)
                .replace(/\s/g, '')
            }
            return {
              type: 'ITEM_VARIATION',
              id: `#product${i}_variation${index}`,
              itemVariationData: {
                itemId: `#new_product${i}`,
                name: variation.variationName || variation.productName,
                sku: `${userSku}-${variationSku}`,
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: variation.variationPrice || 0,
                  currency: 'CAD',
                },
                trackInventory: true,
                availableForBooking: false,
                stockable: true,
              },
              presentAtAllLocations: false,
              presentAtLocationIds: vendorLocations,
              customAttributeValues: {
                vendor_name: {
                  stringValue: squareName,
                },
              },
            }
          }
        )

        if (defaultInventoryWarningLevel > 0) {
          for (let i = 0; i < newProductVariations.length; i++) {
            newProductVariations[i].itemVariationData.locationOverrides =
              locationOverrides
          }
        }

        let newProductObject = {
          type: 'ITEM',
          id: `#new_product${i}`,
          customAttributeValues: {
            vendor_name: {
              stringValue: squareName,
            },
          },
          presentAtAllLocations: false,
          presentAtLocationIds: vendorLocations,
          itemData: {
            name: organizedProducts[i][0].productName,
            variations: newProductVariations,
            categoryId: squareId,
          },
        }

        try {
          response = await squareClient.catalogApi.upsertCatalogObject({
            idempotencyKey: nanoid(),
            object: newProductObject,
          })
        } catch (error) {
          for (let j = 0; j < organizedProducts[i].length; j++) {
            hasError = true
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'Failed',
              message: 'Error calling Square API',
            })
          }
          console.log(error)
          continue productLoop
        }
      }

      if (response?.result?.idMappings) {
        let today = new Date(Date.now())

        //save the new product ID:
        let newProductIdEl = response.result.idMappings.find((el) => {
          return el.clientObjectId.includes('#new_product')
        })
        if (newProductIdEl) {
          for (let j = 0; j < organizedProducts[i].length; j++) {
            organizedProducts[i][j].productId = newProductIdEl.objectId
          }
        }

        //save the new variation IDs:
        const mappableOrganizedProducts = organizedProducts.flat()

        for (let j = 0; j < response.result.idMappings.length; j++) {
          if (
            response.result.idMappings[j].clientObjectId.includes('variation')
          ) {
            let newItemIndex = mappableOrganizedProducts.findIndex((el) => {
              return (
                el.variationId == response.result.idMappings[j].clientObjectId
              )
            })
            mappableOrganizedProducts[newItemIndex].variationId =
              response.result.idMappings[j].objectId
          }
        }

        // get the new variation IDs to initialize inventory to 0
        let newVariationIds = response.result.idMappings.filter((el) => {
          var originalId = el.clientObjectId
          return originalId.includes('variation')
        })

        let inventoryChanges = newVariationIds
          .map((el) => {
            var locationCountObj = vendorLocations.map((location) => {
              return {
                type: 'PHYSICAL_COUNT',
                physicalCount: {
                  catalogObjectId: el.objectId,
                  state: 'IN_STOCK',
                  locationId: location,
                  quantity: '0',
                  occurredAt: today.toISOString(),
                },
              }
            })

            return locationCountObj
          })
          .flat()

        try {
          const inventoryResponse =
            await squareClient.inventoryApi.batchChangeInventory({
              idempotencyKey: nanoid(),
              changes: inventoryChanges,
            })
        } catch (error) {
          hasError = true
          for (let j = 0; j < organizedProducts[i].length; j++) {
            resultsJSON.push({
              ...organizedProducts[i][j],
              status: 'OK',
              message:
                'Product created, but error initializing inventory for new products',
            })
          }
          console.log(error)
          continue productLoop
        }
      }

      for (let j = 0; j < organizedProducts[i].length; j++) {
        resultsJSON.push({
          ...organizedProducts[i][j],
          status: 'OK',
          message: 'Item successfully created.',
        })
      }
    }

    for (let i = 0; i < resultsJSON.length; i++) {
      await csvWriter.writeRecords([
        {
          productName: resultsJSON[i].productName,
          variationName: resultsJSON[i].variationName,
          variationSku: resultsJSON[i].variationSku,
          variationPrice: resultsJSON[i].variationPrice,
          productId: resultsJSON[i].productId,
          variationId: resultsJSON[i].variationId,
          status: resultsJSON[i].status,
          message: resultsJSON[i].message,
        },
      ])
    }

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(
      resultFilepath,
      { resource_type: 'auto', use_filename: true }
    )

    const updatedFileAction = await FileAction.findByIdAndUpdate(
      fileActionId,
      {
        status: hasError
          ? FILE_UPLOAD_STATUS.COMPLETE_WITH_ERROR
          : FILE_UPLOAD_STATUS.COMPLETE,
        resultsFileUrl: cloudinaryResponse.secure_url,
        resultsFilePublicId: cloudinaryResponse.public_id,
      },
      {
        new: true,
      }
    )
    done()
  })
}
