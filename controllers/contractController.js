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
export const createContractInner = async (
  vendorId,
  locationId,
  contractType = null,
  startDate = null,
  endDate = null
) => {
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
  var locationId = res.locals?.locationId
  var vendorId = res.locals?.vendorId

  const { contractType, startDate, endDate } = req.body
  if (!locationId) {
    locationId = req.body.locationId
  }
  if (!vendorId) {
    vendorId = req.body.vendorId
  }

  const newContract = await createContractInner(
    vendorId,
    locationId,
    (contractType = null),
    (startDate = null),
    (endDate = null)
  )

  console.log(newContract)
  res.locals.locationId = newContract._id

  return res.status(StatusCodes.OK).json({ newContract })
}
