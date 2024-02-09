import { StatusCodes } from 'http-status-codes'
import RentPayment from '../models/RentPaymentModel.js'

export const getAllPaymentsVendor = async (req, res) => {
  const searchObj = { vendor: req.user.userId }
  const paymentsDue = await RentPayment.find(searchObj).populate(
    'contract',
    'contractId contractType location'
  )
  res.status(StatusCodes.OK).json({ paymentsDue })
}

export const getAllPaymentsAdmin = async (req, res) => {
  const paymentsDue = await RentPayment.find().populate(
    'contract',
    'contractId contractType location'
  )
  res.status(StatusCodes.OK).json({ paymentsDue })
}

export const getPayment = async (req, res) => {
  const payment = await RentPayment.findById(req.params.id).populate(
    'contract',
    'contractId contractType location'
  )
  res.status(StatusCodes.OK).json({ payment })
}

export const editPayment = async (req, res) => {
  const updateObj = {
    ...req.body,
  }

  if (req.body.paymentDate && req.body.paymentRef) {
    updateObj.paid = true
  }

  const updatedPayment = await RentPayment.findByIdAndUpdate(
    req.params.id,
    updateObj,
    {
      new: true,
    }
  )

  res.status(StatusCodes.OK).json({ payment: updatedPayment })
}

// this is used in authController - when new user is registered, initial payment is immediately added
export const createPayment = async ({
  contract,
  vendorId,
  amountDue,
  forPeriodStart,
  forPeriodEnd = null,
}) => {
  const paymentObj = {
    contract: contract,
    vendor: vendorId,
    amountDue: amountDue,
    forPeriodStart: forPeriodStart,
  }

  if (forPeriodEnd) {
    paymentObj.forPeriodEnd = forPeriodEnd
  }

  const newPayment = await RentPayment.create(paymentObj)

  return newPayment
}
