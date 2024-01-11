import { transporter } from '../../middleware/nodemailerMiddleware.js'
import { squareClient } from '../../utils/squareUtils.js'
import User from '../../models/UserModel.js'

import bwipjs from 'bwip-js'
import * as fs from 'fs'
import { dirname } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'
import archiver from 'archiver'
import day from 'dayjs'
import { SquareApiError } from '../../errors/customError.js'
import { STORE_EMAIL } from '../../utils/constants.js'

export default (agenda) => {
  agenda.define('export barcodes', async function (job, done) {
    //first, obtain the list of SKUs that we want to turn into barcodes
    const userId = job.attrs.data.userId
    const squareName = job.attrs.data.squareName

    let fullSkuList = []

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

    let skus = response.result.items
      .map((catalogItem) => {
        var variationList = catalogItem.itemData.variations.map((variation) => {
          return variation.itemVariationData.sku
        })
        return variationList
      })
      .flat()

    //fullSkuList.push(skus)
    fullSkuList = fullSkuList.concat(skus)

    while (cursor != '') {
      searchQuery.cursor = cursor
      response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
      if (!response) {
        throw new SquareApiError('error while calling the Square API')
      }
      cursor = response.result.cursor

      skus = response.result.items
        .map((catalogItem) => {
          var variationList = catalogItem.itemData.variations.map(
            (variation) => {
              return variation.itemVariationData.sku
            }
          )
          return variationList
        })
        .flat()

      fullSkuList = fullSkuList.concat(skus)
    }

    //at this point, fullSkuList is the array that we want to turn into barcodes
    //start initializing the zip files:

    const __dirname = dirname(fileURLToPath(import.meta.url))
    const zipFilePath = path.resolve(
      __dirname,
      '../../public/uploads',
      `barcodes.zip`
    )
    const zipOutput = fs.createWriteStream(zipFilePath)

    //set up the archiver:
    const archive = archiver('zip', {
      zlib: { level: 6 }, // Sets the compression level.
    })
    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
        console.log(err)
      } else {
        // throw error
        console.log(err)
        throw err
      }
    })
    // good practice to catch this error explicitly
    archive.on('error', function (err) {
      console.log(err)
      throw err
    })
    // pipe archive data to the file
    archive.pipe(zipOutput)

    const barcodeItems = [...new Set(fullSkuList)]

    for (let i = 0; i < barcodeItems.length; i++) {
      let barcodeBuffer
      try {
        // The return value is the canvas element
        barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'code128', // Barcode type
          text: barcodeItems[i], // Text to encode
          scale: 3, // 3x scaling factor
          height: 10, // Bar height, in millimeters
          includetext: true, // Show human-readable text
          textxalign: 'center', // Always good to set this
        })

        archive.append(barcodeBuffer, { name: `${barcodeItems[i]}.png` })
      } catch (e) {
        // `e` may be a string or Error object
        console.log(e)
      }
    }

    archive.finalize()

    //zip file is ready to be sent in an email:
    const user = await User.findOne({ _id: userId })
    const date = day().format('YYYY-MM-DD')

    let attachments = [
      {
        filename: `${date}-barcode-export.zip`,
        path: zipFilePath,
      },
    ]

    let message = {
      from: STORE_EMAIL,
      to: user.email,
      subject: 'Product Barcode Export',
      text: 'Your requested barcodes have been generated.',
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
