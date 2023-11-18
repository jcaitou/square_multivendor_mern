import Order from '../../models/OrderModel.js'
import mongoose from 'mongoose'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import day from 'dayjs'
import createCsvWriter from 'csv-writer'
import { ALL_LOCATIONS, STORE_EMAIL } from '../../utils/constants.js'
import { transporter } from '../../middleware/nodemailerMiddleware.js'
import User from '../../models/UserModel.js'

export default (agenda) => {
  agenda.define('export orders', async function (job, done) {
    const { user: userTemp, month, year, locationsQuery } = job.attrs.data

    //copy below

    const user = await User.findOne({ _id: userTemp.userId })
    const id = new mongoose.Types.ObjectId(user._id)

    let locations
    if (!locationsQuery) {
      locations = user.locations
    } else if (Array.isArray(locationsQuery)) {
      locations = locationsQuery
    } else {
      locations = [locationsQuery]
    }

    const matchObj = {
      $and: [
        { 'orderItems.itemVendor': id },
        { location: { $exists: true, $in: locations } },
      ],
    }

    //search by dates:
    let dateQuery = {}
    let startDate = day().year(year).startOf('year')
    let endDate = day().year(year).endOf('year')
    if (month && month != '') {
      startDate = startDate.month(month).startOf('month')
      endDate = endDate.month(month).endOf('month')
    }
    dateQuery.$gte = startDate.toDate()
    dateQuery.$lte = endDate.toDate()
    matchObj.orderDate = dateQuery

    const queryObj = {
      $match: matchObj,
    }
    const sortKey = '-orderDate'

    const orders = await Order.aggregate([
      queryObj,
      {
        $addFields: {
          filteredOrderItems: {
            $filter: {
              input: '$orderItems',
              as: 'd',
              cond: {
                $eq: ['$$d.itemVendor', id],
              },
            },
          },
        },
      },
      {
        $addFields: {
          totalPrice: {
            $sum: '$filteredOrderItems.totalMoney',
          },
        },
      },
      {
        $unset: 'orderItems',
      },
    ]).sort(sortKey)

    //write to csv initialization
    const date = day().format('YYYY-MM-DD')
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const resultFilepath = path.resolve(
      __dirname,
      '../../public/uploads',
      `${date}-${user.name}-order-export.csv`
    )

    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: resultFilepath,
      header: [
        { id: 'orderId', title: 'Order ID' },
        { id: 'location', title: 'Location' },
        { id: 'orderDate', title: 'Order Date' },
        { id: 'itemName', title: 'Item Name' },
        { id: 'itemVariationName', title: 'Variation Name' },
        { id: 'itemSku', title: 'SKU' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'basePrice', title: 'Base Price' },
        { id: 'totalDiscount', title: 'Discount Applied' },
        { id: 'totalMoney', title: 'Sale Price' },
        { id: 'itemId', title: 'Item ID' },
        { id: 'itemVariationId', title: 'Variation ID' },
      ],
    })
    //write to csv initialization - end

    //start of write to csv
    for (let i = 0; i < orders.length; i++) {
      for (let j = 0; j < orders[i].filteredOrderItems.length; j++) {
        const locationName = ALL_LOCATIONS.find((el) => {
          return el.id === orders[i].location
        })
        await csvWriter.writeRecords([
          {
            orderId: orders[i].orderId,
            location: locationName.name,
            orderDate: orders[i].orderDate,
            itemName: orders[i].filteredOrderItems[j].itemName,
            itemVariationName:
              orders[i].filteredOrderItems[j].itemVariationName,
            itemSku: orders[i].filteredOrderItems[j]?.itemSku.slice(5) || '',
            // itemSku: '',
            quantity: orders[i].filteredOrderItems[j].quantity,
            basePrice: orders[i].filteredOrderItems[j].basePrice / 100.0,
            totalDiscount:
              orders[i].filteredOrderItems[j].totalDiscount / 100.0,
            totalMoney: orders[i].filteredOrderItems[j].totalMoney / 100.0,
            itemId: orders[i].filteredOrderItems[j].itemId,
            itemVariationId: orders[i].filteredOrderItems[j].itemVariationId,
          },
        ])
      }
    }
    //end of write to csv

    //send the email
    let attachments = [
      {
        filename: `${date}-order-export.csv`,
        path: resultFilepath,
      },
    ]

    let message = {
      from: STORE_EMAIL,
      to: user.email,
      subject: 'Export of your orders',
      text: 'Your requested orders have finished exporting.',
      attachments: attachments,
    }
    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err)
      }
    })

    //copy above

    done()
  })
}
