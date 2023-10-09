import { StatusCodes } from 'http-status-codes'
import User from '../models/UserModel.js'
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { UnauthenticatedError } from '../errors/customError.js'
import { createJWT } from '../utils/tokenUtils.js'

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0
  req.body.role = isFirstAccount ? 'admin' : 'user'

  // a random value that is added to the password before hashing
  const hashedPassword = await hashPassword(req.body.password)
  req.body.password = hashedPassword

  const user = await User.create(req.body)
  res.status(StatusCodes.CREATED).json({ msg: 'user created' })
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
    squareName: user.squareName,
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
