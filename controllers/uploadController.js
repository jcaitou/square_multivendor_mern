import { StatusCodes } from 'http-status-codes'
import FileAction from '../models/FileActionModel.js'
import User from '../models/UserModel.js'
import { FILE_UPLOAD_STATUS } from '../utils/constants.js'
import { BadRequestError } from '../errors/customError.js'
import agenda from '../jobs/agenda.js'
import cloudinary from 'cloudinary'

export const getAllFileActions = async (req, res, next) => {
  const queryObj = { createdBy: req.user.userId }
  // setup pagination
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 50
  const skip = (page - 1) * limit
  const fileActions = await FileAction.find(queryObj)
    .skip(skip)
    .limit(limit)
    .sort('-createdAt')
  const totalItems = await FileAction.countDocuments(queryObj)
  const numOfPages = Math.ceil(totalItems / limit)

  res
    .status(StatusCodes.OK)
    .json({ totalItems, numOfPages, currentPage: page, fileActions })
}

export const batchUpdateUploadFile = async (req, res, next) => {
  if (!req.file) {
    throw new BadRequestError('File is required')
  }

  const user = await User.findOne({ _id: req.user.userId })
  const defaultInventoryWarningLevel =
    user.settings.defaultInventoryWarningLevel

  const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    req.file.path,
    { resource_type: 'auto', use_filename: true }
  )
  //await fs.unlink(req.file.path)

  const fileAction = await FileAction.create({
    fileType: req.body.type,
    fileName: req.file.filename,
    fileUrl: cloudinaryResponse.secure_url,
    filePublicId: cloudinaryResponse.public_id,
    status: FILE_UPLOAD_STATUS.RUNNING,
    resultsFileUrl: null,
    resultsFilePublicId: null,
    createdBy: req.user.userId,
  })

  if (req.body.type == 'product') {
    agenda.now('product import', {
      squareName: req.user.name,
      squareId: req.user.squareId,
      locations: req.user.locations,
      filename: req.file.filename,
      fileUrl: cloudinaryResponse.secure_url,
      fileActionId: fileAction._id,
      defaultInventoryWarningLevel,
    })
  } else if (req.body.type == 'inventory-recount') {
    agenda.now('inventory recount', {
      squareName: req.user.name,
      squareId: req.user.squareId,
      locations: req.user.locations,
      filename: req.file.filename,
      fileUrl: cloudinaryResponse.secure_url,
      fileActionId: fileAction._id,
    })
  }

  res.status(StatusCodes.CREATED).json({ msg: 'process started' })
}

export const startFileAction = async (req, res) => {
  //if status is already running, do nothing and exit

  const fileActionInfo = await Job.findById(req.params.id)

  //else:
  const fileAction = await FileAction.findByIdAndUpdate(
    req.params.id,
    {
      status: FILE_UPLOAD_STATUS.RUNNING,
    },
    {
      new: true,
    }
  )
  res.status(StatusCodes.OK).json({ fileAction: fileAction })
}
