import { nanoid } from 'nanoid'
import { FILE_UPLOAD_STATUS } from '../../utils/constants.js'
import { squareClient } from '../../utils/squareUtils.js'
import FileAction from '../../models/FileActionModel.js'
import Location from '../../models/LocationModel.js'
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
  agenda.define('inventory recount', async function (job, done) {
    // your code goes here
    const {
      squareName,
      squareId,
      locations: vendorLocations,
      filename: fileName,
      fileUrl,
      fileActionId,
    } = job.attrs.data

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

    let dataHeaders
    const inventoryUpdateData = await csv()
      .on('header', (header) => {
        dataHeaders = header
      })
      .fromFile(filepath)

    if (inventoryUpdateData == null) {
      //error
    }

    let inventoryChanges = []
    let resultsJSON = []
    let today = new Date(Date.now())
    let errorMsg = ''
    let hasError = false

    //array of valid location names:
    const allLocations = await Location.find()
    let allLocationNames = allLocations.map((el) => el.name)

    //this is the total number of locations included in the file:
    let headerLocations = dataHeaders.filter((el) =>
      allLocationNames.includes(el)
    )

    productLoop: for (let i = 0; i < inventoryUpdateData.length; i++) {
      let validEl = true
      let currUpdateItem = Object.entries(inventoryUpdateData[i])
      let variationId = currUpdateItem.find((element) => {
        return element[0].toUpperCase() == 'VARIATION ID'
      })

      //check if catalog object exists
      let currProductResponse
      try {
        currProductResponse =
          await squareClient.catalogApi.retrieveCatalogObject(
            variationId[1],
            true
          )
      } catch (error) {
        hasError = true
        resultsJSON.push({
          ...inventoryUpdateData[i],
          status: 'Failed',
          message: 'ID does not match any existing product',
        })
        console.log('ID does not match any existing product')
        continue productLoop
      }

      let relatedItem = currProductResponse.result.relatedObjects.filter(
        (el) => {
          return (
            el.id == currProductResponse.result.object.itemVariationData.itemId
          )
        }
      )

      let itemVendor =
        relatedItem[0].customAttributeValues['vendor_name'].stringValue

      if (itemVendor != squareName) {
        hasError = true
        resultsJSON.push({
          ...inventoryUpdateData[i],
          status: 'Failed',
          message: 'Not authorized to edit this product',
        })
        console.log('Not authorized to edit this product')
        continue productLoop
      }

      let invObj = headerLocations.map((el) => {
        let quantity = currUpdateItem.find((element) => {
          return element[0].toUpperCase() == el.toUpperCase()
        })

        //check if quantity is a number
        if (!Number.isInteger(parseInt(quantity[1]))) {
          errorMsg = 'quantity is not a number'
          validEl = false
          return {}
        }

        //don't need to check if location ID exists because headerLocations is already checked against the allLocations list
        let locationId = allLocations.find((location) => {
          return location.name.toUpperCase() == el.toUpperCase()
        })

        return {
          type: 'PHYSICAL_COUNT',
          physicalCount: {
            catalogObjectId: variationId[1],
            state: 'IN_STOCK',
            locationId: locationId.id,
            quantity: quantity[1],
            occurredAt: today.toISOString(),
          },
        }
      })

      //populate inventory changes array:
      if (validEl) {
        inventoryChanges.push(invObj)
      } else {
        hasError = true
      }

      //write to results file:
      resultsJSON.push({
        ...inventoryUpdateData[i],
        status: validEl ? 'OK' : 'Failed',
        message: validEl
          ? `Inventory updated successfully for ${headerLocations.length} location(s)`
          : errorMsg,
      })
    }

    try {
      const response = await squareClient.inventoryApi.batchChangeInventory({
        idempotencyKey: nanoid(),
        changes: inventoryChanges.flat(),
      })
    } catch (error) {
      hasError = true
      console.log(error.errors[0].code)
      for (let i = 0; i < resultsJSON.length; i++) {
        console.log(resultsJSON[i].status)
        if (resultsJSON[i].status == 'OK') {
          resultsJSON[i].status = 'Failed'
          resultsJSON[
            i
          ].message = `${error.errors.code}: ${error.errors.detail}`
        }
      }
    } finally {
      //console.log(resultsJSON)
      let headerTitles = Object.keys(resultsJSON[0])
      const csvWriter = createCsvWriter.createArrayCsvWriter({
        // path: `./uploads/${fileName.replace('Import-', 'Results-')}`,
        path: resultFilepath,
        header: headerTitles,
      })
      for (let i = 0; i < resultsJSON.length; i++) {
        let rowValues = [Object.values(resultsJSON[i])]
        await csvWriter.writeRecords(rowValues)
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
    }
    done()
  })
}
