import cron from 'node-cron'
import mongoose from 'mongoose'
import { squareClient } from '../utils/squareUtils.js'
import Contract from '../models/ContractModel.js'
import Order from '../models/OrderModel.js'
import User from '../models/UserModel.js'
import Location from '../models/LocationModel.js'
import RentPayment from '../models/RentPaymentModel.js'
import day from 'dayjs'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'

//cases that have not been accounted for:
//non-renewed contract - pro-rata calculation of rent

//cases that have not been tested:
//if it will not be renewed - all 3 scenarios

//this loops through all ACTIVE contracts and:
//-generates new receivable object, if any
//-if willBeRenewed is true: extends the contract endDate
//-if willBeRenewed is false: marks contract as ended if we have passed the contract endDate
export const generateReceivables = async () => {
  const activeContracts = await Contract.find({ started: true, ended: false })
  const today = day()

  for (let i = 0; i < activeContracts.length; i++) {
    const contractId = activeContracts[i]._id

    const payments = await RentPayment.findOne(
      {
        contract: contractId,
      },
      {},
      { sort: { forPeriodEnd: -1 } }
    )

    //need to sort by date (newest first) and only return the newest item
    console.log(payments)

    //we calculate an arbitrary number of payouts starting from the start date
    let calculationStartDate = day(activeContracts[i].startDate)
    if (payments) {
      calculationStartDate = day(payments.forPeriodEnd).add(1, 'day')
    }
    let calculationEndDate = calculationStartDate
      .add(1, 'month')
      .subtract(1, 'day')
    console.log(
      `next period: ${calculationStartDate.format(
        'YYYY-MM-DD'
      )} to ${calculationEndDate.format('YYYY-MM-DD')}`
    )

    //create the new payment object 7 days before the next period start:
    while (calculationEndDate.isBefore(today.add(7, 'day'), day)) {
      let newPayment,
        paymentObj = null,
        updatedContract = null
      // if (today.isAfter(lastPeriodDate.subtract(7, 'day'))) {
      console.log('need to create new payment item')

      //if the contract will NOT be renewed and there is less than 30 days left, this is a special case
      if (!activeContracts[i].willBeRenewed) {
        const contractEndDate = day(activeContracts[i].endDate)
        if (calculationEndDate.isSame(contractEndDate, 'day')) {
          //do nothing and just let the contract expire
        } else if (
          calculationEndDate
            .add(1, 'month')
            .isSameOrBefore(contractEndDate, 'day')
        ) {
          //add the next period normally (same function as below)
          paymentObj = {
            contract: contractId,
            vendor: activeContracts[i].vendor,
            amountDue: activeContracts[i].monthlyRent,
            forPeriodStart: calculationStartDate.format('YYYY-MM-DD'),
            forPeriodEnd: calculationEndDate.format('YYYY-MM-DD'),
          }
        } else if (
          calculationEndDate.add(1, 'month').isAfter(contractEndDate, 'day')
        ) {
          //add the next period pro-rata with last day set as contractEndDate
        }

        //mark the contract as ended if we have passed the end date:
        if (today.isSameOrAfter(contractEndDate)) {
          updatedContract = await Contract.findByIdAndUpdate(
            contractId,
            { ended: true },
            {
              new: true,
            }
          )
        }
      } else {
        //the contract will be renewed; just keep adding new payment objects
        paymentObj = {
          contract: contractId,
          vendor: activeContracts[i].vendor,
          amountDue: activeContracts[i].monthlyRent,
          forPeriodStart: calculationStartDate.format('YYYY-MM-DD'),
          forPeriodEnd: calculationEndDate.format('YYYY-MM-DD'),
        }

        //also extend the contractEndDate if willBeRenewed = true and we have hit the contractEndDate
        updatedContract = await Contract.findByIdAndUpdate(
          contractId,
          { endDate: calculationEndDate.format('YYYY-MM-DD') },
          {
            new: true,
          }
        )
      }

      if (paymentObj) {
        console.log('create new payment')
        newPayment = await RentPayment.create(paymentObj)
      }

      calculationStartDate = calculationEndDate.add(1, 'day')
      calculationEndDate = calculationStartDate
        .add(1, 'month')
        .subtract(1, 'day')

      console.log('newpayment', newPayment)
    }
  }

  console.log(
    `Generate Receivables completed at ${day().format('MMM DD HH:mm')}`
  )

  return null
}
