import { StatusCodes } from 'http-status-codes'
import User from '../models/UserModel.js'
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { UnauthenticatedError } from '../errors/customError.js'
import { createJWT } from '../utils/tokenUtils.js'
import { squareClient } from '../utils/squareUtils.js'
import { SquareApiError } from '../errors/customError.js'
import { nanoid } from 'nanoid'
import { transporter } from '../middleware/nodemailerMiddleware.js'
import { STORE_EMAIL } from '../utils/constants.js'
import dedent from 'dedent-js'

export const register = async (req, res) => {
  let newUserObj = req.body
  newUserObj.role = 'user'
  // newUserObj.settings = {
  //   receiveInventoryWarningEmails: true,
  //   defaultInventoryWarningLevel: 5,
  //   defaultDiscountOptIn: false,
  // }

  // console.log(newUserObj)
  // return res.status(StatusCodes.CREATED).json({ msg: 'user created' })

  let response
  try {
    response = await squareClient.catalogApi.upsertCatalogObject({
      idempotencyKey: nanoid(),
      object: {
        type: 'CATEGORY',
        id: '#new',
        categoryData: {
          name: req.body.name,
        },
      },
    })
  } catch (error) {
    throw new SquareApiError(
      error?.errors[0].detail || 'error while creating category'
    )
  }

  const totalUsers = await User.countDocuments()
  newUserObj.skuId = totalUsers + 1
  newUserObj.squareId = response.result.catalogObject.id
  const newPassword = nanoid()
  const hashedPassword = await hashPassword(newPassword)
  newUserObj.password = hashedPassword

  const user = await User.create(newUserObj)

  console.log(user)

  const emailText = dedent`
    Dear ${newUserObj.name},

    Your account has been created.
    Name: ${newUserObj.name}
    Email: ${newUserObj.email}
    Password: ${newPassword}

    Please remember to change your password as soon as possible.

    Makers2
    `
  let message = {
    from: STORE_EMAIL,
    to: newUserObj.email,
    subject: 'Welcome to Makers2!',
    text: emailText,
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err)
    } else {
      //console.log(info)
    }
  })

  res.status(StatusCodes.CREATED).json({ msg: 'user created' })
}
export const registerSpecific = async (req, res) => {
  //only for adding specific user info during testing phase

  // a random value that is added to the password before hashing
  const hashedPassword = await hashPassword(req.body.password)
  req.body.password = hashedPassword
  const user = await User.create(req.body)
  res.status(StatusCodes.CREATED).json({ msg: 'user created' })
}

export const changePassword = async (req, res) => {
  //users should only be allowed to change password, all other values are critical to run the program smoothly

  const user = await User.findById(req.user.userId)
  if (!user) {
    throw new UnauthenticatedError('no user with that email')
  }
  const isPasswordCorrect = await comparePassword(
    req.body.oldPassword,
    user.password
  )
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('password is incorrect')
  }

  const hashedPassword = await hashPassword(req.body.newPassword)

  const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    { password: hashedPassword },
    {
      new: true,
    }
  )
  res.status(StatusCodes.OK).json({ msg: 'password updated' })
}

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    throw new UnauthenticatedError('no user with that email')
  }
  const isPasswordCorrect = await comparePassword(
    req.body.password,
    user.password
  )
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('password is incorrect')
  }

  const token = createJWT({
    userId: user._id,
    name: user.name,
    squareId: user.squareId,
    locations: user.locations,
    role: user.role,
    active: user.active,
  })

  const oneDay = 1000 * 60 * 60 * 24

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  })
  res.status(StatusCodes.CREATED).json({ msg: 'user logged in' })
}

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}
