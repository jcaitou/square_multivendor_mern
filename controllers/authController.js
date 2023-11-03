import { StatusCodes } from 'http-status-codes'
import User from '../models/UserModel.js'
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { UnauthenticatedError } from '../errors/customError.js'
import { createJWT } from '../utils/tokenUtils.js'
import { squareClient } from '../utils/squareUtils.js'
import { SquareApiError } from '../errors/customError.js'
import { nanoid } from 'nanoid'
import { transporter } from '../middleware/nodemailerMiddleware.js'

export const register = async (req, res) => {
  let newUserObj = req.body
  newUserObj.role = 'user'

  const response = await squareClient.catalogApi.upsertCatalogObject({
    idempotencyKey: nanoid(),
    object: {
      type: 'CATEGORY',
      id: '#new',
      categoryData: {
        name: req.body.name,
      },
    },
  })

  if (!response) {
    throw new SquareApiError('error while creating new category')
  }

  newUserObj.squareId = response.result.catalogObject.id

  const newPassword = nanoid()
  const hashedPassword = await hashPassword(newPassword)
  newUserObj.password = hashedPassword

  const user = await User.create(newUserObj)

  let message = {
    from: 'from-example@email.com',
    to: newUserObj.email,
    subject: 'Welcome to Makers2!',
    text: `Your account has been created.\n\n
    Name: ${newUserObj.name}\n
    Email: ${newUserObj.email}\n
    Password: ${newPassword}\n\n

    Please remember to change your password as soon as possible.
    `,
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
