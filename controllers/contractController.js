//create contract
//start contract
//separately: enable & disable vendor account
import { StatusCodes } from 'http-status-codes'
import Contract from '../models/ContractModel.js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customError.js'
import { assignLocationInner } from '../controllers/locationController.js'
import { createPayment } from './paymentController.js'

export const getAllContractsVendor = async (req, res) => {
  const searchObj = { vendor: req.user.userId }
  const contracts = await Contract.find(searchObj)
  res.status(StatusCodes.OK).json({ contracts })
}

export const getAllContractsAdm = async (req, res) => {
  const contracts = await Contract.find()
  res.status(StatusCodes.OK).json({ contracts })
}

export const getContract = async (req, res) => {
  const contract = await Contract.findById(req.params.id)
  // const contract = await Contract.find(searchObj)
  res.status(StatusCodes.OK).json({ contract })
}

export const startContract = async (req, res) => {
  const updateObj = {
    ...req.body,
    started: true,
  }

  console.log(updateObj)

  const updatedContract = await Contract.findByIdAndUpdate(
    req.params.id,
    updateObj,
    {
      new: true,
    }
  )

  await assignLocationInner(updatedContract.location, updatedContract.vendor)

  // res.status(StatusCodes.OK).json({ msg: 'ok' })
  res.status(StatusCodes.OK).json({ contract: updatedContract })
}

// this is used in authController - when new user is registered, initial contract is immediately added
export const createContractInner = async ({
  vendorId,
  locationId,
  monthlyRent = null,
  contractType = null,
  startDate = null,
  endDate = null,
}) => {
  const contractObj = {
    vendor: vendorId,
    location: locationId,
    renewable: true,
    willBeRenewed: true,
  }
  const existingContract = await Contract.find({
    vendor: vendorId,
    location: locationId,
    ended: false,
  })
  console.log(existingContract)
  if (Array.isArray(existingContract) && existingContract.length > 0)
    throw new BadRequestError(
      `existing active contract already exists for this vendor and this location`
    )

  if (monthlyRent) {
    contractObj.monthlyRent = monthlyRent
  }

  if (contractType) {
    contractObj.contractType = contractType
  }

  if (startDate) {
    contractObj.startDate = startDate
  }

  if (endDate) {
    contractObj.endDate = endDate
  }

  const newContract = await Contract.create(contractObj)
  return newContract
}

export const createContract = async (req, res) => {
  console.log({
    ...req.body,
    monthlyRent: Number(req.body.montlyRent) * 100,
  })
  console.log({
    monthlyRent: Number(req.body.montlyRent) * 100,
    ...req.body,
  })
  const contract = await createContractInner({
    ...req.body,
    monthlyRent: Number(req.body.montlyRent) * 100,
  })

  const payment = await createPayment({
    contract: contract.id,
    vendorId: req.body.vendorId,
    amountDue: contract.monthlyRent,
    forPeriodStart: contract.startDate,
  })

  return res.status(StatusCodes.OK).json({ contract })
}
