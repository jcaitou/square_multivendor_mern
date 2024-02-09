import { body, query, param, validationResult } from 'express-validator'
import { squareClient } from '../utils/squareUtils.js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customError.js'
import mongoose from 'mongoose'
import User from '../models/UserModel.js'
import Contract from '../models/ContractModel.js'
import RentPayment from '../models/RentPaymentModel.js'
import Payout from '../models/PayoutModel.js'

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg)
        if (errorMessages[0].startsWith('no job')) {
          throw new NotFoundError(errorMessages)
        }
        if (errorMessages[0].startsWith('not authorized')) {
          throw new UnauthorizedError('not authorized to access this route')
        }
        throw new BadRequestError(errorMessages)
      }
      next()
    },
  ]
}

export const validateProductInput = withValidationErrors([
  body('title').notEmpty().withMessage('product name is required').trim(),
  body('variations')
    .isArray({ min: 1 })
    .withMessage('at least one variation is required')
    .custom(async (variations) => {
      for (let i = 0; i < variations.length; i++) {
        if (isNaN(variations[i].price) || Number(variations[i].price) <= 0) {
          throw new BadRequestError('price needs to be a number greater than 0')
        }
      }
    }),
])

// export const validateProductUpdateInput = withValidationErrors([
//   body('itemData.name').notEmpty().withMessage('product name is required'),
//   body('itemData.variations')
//     .notEmpty()
//     .withMessage('at least one variation is required'),
//   body('version').notEmpty().withMessage('version token is required'),
// ])

export const validatePaymentInput = withValidationErrors([
  body('reference').notEmpty().withMessage('reference is required'),
])

export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email) => {
      const user = await User.findOne({ email })
      if (user) {
        throw new BadRequestError('email already exists')
      }
    }),
  // body('locations').notEmpty().withMessage('locations is required'),
])

export const validatePasswordUpdateInput = withValidationErrors([
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword')
    .exists({ checkFalsy: true })
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long'),
  body('confirmNewPassword')
    .exists({ checkFalsy: true })
    .withMessage('Confirm your new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('The passwords do not match'),
])

export const validateLoginInput = withValidationErrors([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
  body('password').notEmpty().withMessage('password is required'),
])

export const validateUpdateUserInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email })
      if (user && user._id.toString() !== req.user.userId) {
        throw new Error('email already exists')
      }
    }),
  body('lastName').notEmpty().withMessage('last name is required'),
  body('location').notEmpty().withMessage('location is required'),
])

export const validateOrderQueryInput = withValidationErrors([
  query('startDate').custom((startDate, { req }) => {
    const formattedStart = new Date(startDate)
    const formattedEnd = new Date(req.query.endDate)

    if (
      isNaN(Date.parse(formattedStart)) === false &&
      isNaN(Date.parse(formattedEnd)) === false &&
      startDate > req.query.endDate
    ) {
      throw new Error('Start date must be before end date')
    }
    return true
  }),
])

/* validate ID params */
export const validateProductIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    try {
      const retrieveResponse =
        await squareClient.catalogApi.retrieveCatalogObject(value, false)
      const itemVendor =
        retrieveResponse.result.object.customAttributeValues['vendor_name']
          .stringValue
      if (itemVendor != req.user.name) {
        throw new UnauthorizedError('not authorized to access this route')
      }
    } catch (error) {
      throw new NotFoundError(`no product with id : ${value}`)
    }
  }),
])

// export const validateContractIdParam = withValidationErrors([
//   param('id').custom(async (value, { req }) => {
//     const isValidId = mongoose.Types.ObjectId.isValid(value)
//     if (!isValidId) throw new BadRequestError('invalid MongoDB id')
//     const contract = await Contract.findById(value)
//     if (!contract) throw new NotFoundError(`no job with id : ${value}`)

//     const isAdmin = req.user.role === 'admin'
//     const isOwner = req.user.userId === contract.vendor.toString()
//     if (!isAdmin && !isOwner)
//       throw new UnauthorizedError('not authorized to access this route')
//   }),
// ])

// export const validatePaymentIdParam = withValidationErrors([
//   param('id').custom(async (value, { req }) => {
//     const isValidId = mongoose.Types.ObjectId.isValid(value)
//     if (!isValidId) throw new BadRequestError('invalid MongoDB id')
//     const payment = await RentPayment.findById(value)
//     if (!payment) throw new NotFoundError(`no payment with id : ${value}`)

//     const isAdmin = req.user.role === 'admin'
//     const isOwner = req.user.userId === payment.vendor.toString()
//     if (!isAdmin && !isOwner)
//       throw new UnauthorizedError('not authorized to access this route')
//   }),
// ])

export const validateIdParam = (objType) => {
  return withValidationErrors([
    param('id').custom(async (value, { req }) => {
      const isValidId = mongoose.Types.ObjectId.isValid(value)
      if (!isValidId) throw new BadRequestError('invalid MongoDB id')
      let findObj
      switch (objType) {
        case 'RentPayment':
          findObj = await RentPayment.findById(value)
          break
        case 'Contract':
          findObj = await Contract.findById(value)
          break
        case 'Payout':
          findObj = await Payout.findById(value)
          break
      }
      // const payment = await RentPayment.findById(value)
      if (!findObj) throw new NotFoundError(`no ${objType} with id : ${value}`)

      const isAdmin = req.user.role === 'admin'
      const isOwner = req.user.userId === findObj.vendor.toString()
      if (!isAdmin && !isOwner)
        throw new UnauthorizedError('not authorized to access this route')
    }),
  ])
}
