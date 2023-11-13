import { transporter } from '../../middleware/nodemailerMiddleware.js'
import { squareClient } from '../../utils/squareUtils.js'
import User from '../../models/UserModel.js'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import createCsvWriter from 'csv-writer'
import path from 'path'
import day from 'dayjs'
import { SquareApiError } from '../../errors/customError.js'

export default (agenda) => {
  agenda.define('export all products', async function (job, done) {
    const userId = job.attrs.data.userId
    const squareName = job.attrs.data.squareName
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
    let products = response.result.items
    let variationsData = products
      .map((product) => {
        return product.itemData.variations.map((variation) => {
          return {
            productName: product.itemData.name,
            variationName: variation.itemVariationData.name,
            variationSku: variation.itemVariationData.sku,
            variationPrice: variation.itemVariationData.priceMoney.amount,
            productId: variation.itemVariationData.itemId.toString(),
            variationId: variation.id.toString(),
          }
        })
      })
      .flat()
    //end of API calls

    //write to csv initialization
    const date = day().format('YYYY-MM-DD')
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const resultFilepath = path.resolve(
      __dirname,
      '../../public/uploads',
      `${date}-${user.name}-product-export.csv`
    )

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: resultFilepath,
      header: [
        { id: 'productName', title: 'productName' },
        { id: 'variationName', title: 'variationName' },
        { id: 'variationSku', title: 'variationSku' },
        { id: 'variationPrice', title: 'variationPrice' },
        { id: 'productId', title: 'productId' },
        { id: 'variationId', title: 'variationId' },
      ],
    })
    //write to csv initialization - end

    //start of write to csv
    for (let i = 0; i < variationsData.length; i++) {
      await csvWriter.writeRecords([
        {
          productName: variationsData[i].productName,
          variationName: variationsData[i].variationName,
          variationSku: variationsData[i].variationSku,
          variationPrice: Number(variationsData[i].variationPrice) / 100.0,
          productId: variationsData[i].productId,
          variationId: variationsData[i].variationId,
        },
      ])
    }
    //end of write to csv

    while (cursor != '') {
      searchQuery.cursor = cursor

      //start of API calls
      response = await squareClient.catalogApi.searchCatalogItems(searchQuery)
      if (!response) {
        throw new SquareApiError('error while calling the Square API')
      }
      cursor = response.result.cursor

      products = response.result.items
      variationsData = products
        .map((product) => {
          return product.itemData.variations.map((variation) => {
            return {
              productName: product.itemData.name,
              variationName: variation.itemVariationData.name,
              variationSku: variation.itemVariationData.sku,
              variationPrice: variation.itemVariationData.priceMoney.amount,
              productId: variation.itemVariationData.itemId.toString(),
              variationId: variation.id.toString(),
            }
          })
        })
        .flat()
      //end of API calls

      //start of write to csv
      for (let i = 0; i < variationsData.length; i++) {
        await csvWriter.writeRecords([
          {
            productName: variationsData[i].productName,
            variationName: variationsData[i].variationName,
            variationSku: variationsData[i].variationSku,
            variationPrice: Number(variationsData[i].variationPrice) / 100.0,
            productId: variationsData[i].productId,
            variationId: variationsData[i].variationId,
          },
        ])
      }
      //end of write to csv
    }

    let attachments = [
      {
        filename: `${date}-product-export.csv`,
        path: resultFilepath,
      },
    ]

    let message = {
      from: 'from-example@email.com',
      to: user.email,
      subject: 'Export of your products',
      text: 'Your products have finished exporting.',
      attachments: attachments,
    }
    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err)
      }
    })
    done()
  })
}
