import cron from 'node-cron'
import mongoose from 'mongoose'
import { squareClient } from '../utils/squareUtils.js'
import Contract from '../models/ContractModel.js'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import Location from '../models/LocationModel.js'
import RentPayment from '../models/RentPaymentModel.js'
import day from 'dayjs'
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter/js'
// day.extend(isSameOrBefore)
// day.extend(isSameOrAfter)
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'

//the following is for when you upload to render:
// try {
//   await mongoose.connect(process.env.MONGO_URL)
//   console.log('Mongoose connected, cron is running...')
//   await copyOrders()
//   process.exit(0)
// } catch (error) {
//   console.log(error)
//   process.exit(1)
// }

//this loops through all ACTIVE contracts and:
//-generates new receivable object, if any
//-if willBeRenewed is true: extends the contract endDate
//-if willBeRenewed is false: marks contract as ended if we have passed the contract endDate
export const generateReceivables = async () => {
  const activeContracts = await Contract.find({ started: true, ended: false })
  const today = day()

  for (let i = 0; i < activeContracts.length; i++) {
    const contractId = activeContracts[i]._id

    // let payments = await RentPayment.aggregate([
    //   { $match: { contract: contractId } },
    //   { $sort: { $forPeriodStart: -1 } },
    // ])
    const payments = await RentPayment.find({
      contract: contractId,
    })
    //need to sort by date (newest first) and only return the newest item
    console.log(payments[0])

    const mostRecentReceivable = payments[0]
    const lastPeriodDate = day(mostRecentReceivable.forPeriodEnd)

    //create the new payment object 7 days before the next period start
    let newPayment
    if (today.isAfter(lastPeriodDate.subtract(7, 'day'))) {
      console.log('need to create new payment item')

      //if the contract will NOT be renewed and there is less than 30 days left, this is a special case
      if (!activeContracts[i].willBeRenewed) {
        const contractEndDate = day(activeContracts[i].endDate)
        if (lastPeriodDate.isSame(contractEndDate, 'day')) {
          //do nothing and just let the contract expire
        } else if (
          lastPeriodDate.add(1, 'month').isSameOrBefore(contractEndDate, 'day')
        ) {
          //add the next period normally (same function as below)
          const paymentObj = {
            contract: contractId,
            vendor: activeContracts[i].vendor,
            amountDue: activeContracts[i].monthlyRent,
            forPeriodStart: day(lastPeriodDate.add(1, 'day')).format(
              'YYYY-MM-DD'
            ),
            forPeriodEnd: day(lastPeriodDate)
              .add(1, 'month')
              .format('YYYY-MM-DD'),
          }
          newPayment = await RentPayment.create(paymentObj)
        } else if (
          lastPeriodDate.add(1, 'month').isAfter(contractEndDate, 'day')
        ) {
          //add the next period pro-rata with last day set as contractEndDate
        }

        //mark the contract as ended if we have passed the end date:
        if (today.isSameOrAfter(contractEndDate)) {
          const updatedContract = await Contract.findByIdAndUpdate(
            contractId,
            { ended: true },
            {
              new: true,
            }
          )
        }
      } else {
        //the contract will be renewed; just keep adding new payment objects
        const nextEndPeriod = day(lastPeriodDate)
          .add(1, 'month')
          .format('YYYY-MM-DD')
        const paymentObj = {
          contract: contractId,
          vendor: activeContracts[i].vendor,
          amountDue: activeContracts[i].monthlyRent,
          forPeriodStart: day(lastPeriodDate.add(1, 'day')).format(
            'YYYY-MM-DD'
          ),
          forPeriodEnd: nextEndPeriod,
        }
        newPayment = await RentPayment.create(paymentObj)

        //also extend the contractEndDate if willBeRenewed = true and we have hit the contractEndDate
        const updatedContract = await Contract.findByIdAndUpdate(
          contractId,
          { endDate: nextEndPeriod },
          {
            new: true,
          }
        )
      }
    }
  }

  console.log(activeContracts)

  console.log(`Copy Orders completed at ${day().format('MMM DD HH:mm')}`)

  return null
}
