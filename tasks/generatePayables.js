import cron from 'node-cron'
import mongoose from 'mongoose'
import Contract from '../models/ContractModel.js'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import Location from '../models/LocationModel.js'
import Payout from '../models/PayoutModel.js'
import day from 'dayjs'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'

//cases that have not been accounted for:
//-if the contract JUST ended (so ended: true) but the payable has not been generated yet

//this loops through all ACTIVE contracts and:
export const generatePayables = async () => {
  const activeContracts = await Contract.find({ started: true, ended: false })
  const today = day()

  for (let i = 0; i < activeContracts.length; i++) {
    const contractId = activeContracts[i]._id
    const id = new mongoose.Types.ObjectId(activeContracts[i].vendor)
    const location = activeContracts[i].location

    const payouts = await Payout.findOne(
      {
        contract: contractId,
      },
      {},
      { sort: { forPeriodEnd: -1 } }
    )
    //need to sort by date (newest first) and only return the newest item
    console.log('payouts:', payouts)

    //we calculate an arbitrary number of payouts starting from the start date
    let calculationStartDate = day(activeContracts[i].startDate)
    if (payouts) {
      calculationStartDate = day(payouts.forPeriodEnd).add(1, 'day')
    }
    let calculationEndDate = calculationStartDate.add(13, 'day')
    console.log(
      `next period: ${calculationStartDate.format(
        'YYYY-MM-DD'
      )} to ${calculationEndDate.format('YYYY-MM-DD')}`
    )

    while (calculationEndDate.isBefore(today, day)) {
      console.log('need to create new payout obj')
      const matchObj = {
        $and: [
          { 'orderItems.itemVendor': id },
          { location: { $exists: true, $in: [location] } },
        ],
        orderDate: {
          $gte: calculationStartDate.toDate(),
          $lte: calculationEndDate
            .hour(23)
            .minute(59)
            .second(59)
            .millisecond(999)
            .toDate(),
        },
      }

      const orders = await Order.aggregate([
        {
          $match: matchObj,
        },
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
          $group: {
            _id: null,
            n: { $sum: 1 },
            price: { $sum: '$totalPrice' },
          },
        },
      ])

      let sales
      if (orders.length < 1) {
        console.log('no sales to payout')
        sales = 0
      } else {
        sales = orders[0].price
      }

      const payoutObj = {
        contract: contractId,
        vendor: activeContracts[i].vendor,
        amountToPay: sales,
        forPeriodStart: calculationStartDate.format('YYYY-MM-DD'),
        forPeriodEnd: calculationEndDate.format('YYYY-MM-DD'),
      }

      const newPayout = await Payout.create(payoutObj)
      console.log('newpayout', newPayout)

      calculationStartDate = calculationEndDate.add(1, 'day')
      calculationEndDate = calculationStartDate.add(13, 'day')
    }
  }

  console.log(`Generate Payables completed at ${day().format('MMM DD HH:mm')}`)

  return null
}
