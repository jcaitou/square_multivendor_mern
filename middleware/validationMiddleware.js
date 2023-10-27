import { body, param, validationResult } from 'express-validator'
import { squareClient } from '../utils/squareUtils.js'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customError.js'
import mongoose from 'mongoose'
import User from '../models/UserModel.js'

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

export const validateProductCreateInput = withValidationErrors([
  body('itemData.name').notEmpty().withMessage('product name is required'),
  body('itemData.variations')
    .notEmpty()
    .withMessage('at least one variation is required'),
])

export const validateProductUpdateInput = withValidationErrors([
  body('itemData.name').notEmpty().withMessage('product name is required'),
  body('itemData.variations')
    .notEmpty()
    .withMessage('at least one variation is required'),
  body('version').notEmpty().withMessage('version token is required'),
])

export const validateProductIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    try {
      const retrieveResponse =
        await squareClient.catalogApi.retrieveCatalogObject(value, false)
      const itemVendor =
        retrieveResponse.result.object.customAttributeValues['vendor_name']
          .stringValue
      if (itemVendor != req.user.squareName) {
        throw new UnauthorizedError('not authorized to access this route')
      }
    } catch (error) {
      throw new NotFoundError(`no product with id : ${value}`)
    }

    // const isAdmin = req.user.role === 'admin'
    // const isOwner = req.user.userId === job.createdBy.toString()
    // if (!isAdmin && !isOwner)
    //   throw new UnauthorizedError('not authorized to access this route')
  }),
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
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long'),
  //body('location').notEmpty().withMessage('location is required'),
  body('squareName').notEmpty().withMessage('square name is required'),
  body('squareId').notEmpty().withMessage('square ID is required'),
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
