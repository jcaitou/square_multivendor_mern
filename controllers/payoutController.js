import { StatusCodes } from 'http-status-codes'
import Payout from '../models/PayoutModel.js'
import day from 'dayjs'

export const getAllPayoutsVendor = async (req, res) => {
  const searchObj = { vendor: req.user.userId }
  const payouts = await Payout.find(searchObj).populate(
    'contract',
    'contractId contractType location'
  )
  res.status(StatusCodes.OK).json({ payouts })
}

export const getAllPayoutsAdmin = async (req, res) => {
  const payouts = await Payout.find()
    .populate('contract', 'contractId contractType location')
    .populate('vendor', 'name')
  res.status(StatusCodes.OK).json({ payouts })
}

export const editPayout = async (req, res) => {
  // console.log(req.body)
  // return res.status(StatusCodes.OK).json({ return: req.body })
  const { payoutDate, reference: payoutRef } = req.body
  const today = day()
  console.log(payoutDate, payoutRef)

  let updateObj = { paid: true, payoutRef: payoutRef }
  if (!payoutDate) {
    updateObj.payoutDate = today.format('DD-MMM-YYYY')
  } else {
    updateObj.payoutDate = day(payoutDate).format('DD-MMM-YYYY')
  }

  console.log(updateObj)

  // const updatedPayout = await Payout.findById(req.params.id)

  const updatedPayout = await Payout.findByIdAndUpdate(
    req.params.id,
    updateObj,
    {
      new: true,
    }
  )
  res.status(StatusCodes.OK).json({ payout: updatedPayout })
}

export const getPayout = async (req, res) => {
  const payout = await Payout.findById(req.params.id).populate(
    'contract',
    'location'
  )
  res.status(StatusCodes.OK).json({ payout })
}
