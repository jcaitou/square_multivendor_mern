import {
  UnauthenticatedError,
  UnauthorizedError,
} from '../errors/customError.js'
import { verifyJWT } from '../utils/tokenUtils.js'

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies
  if (!token) {
    throw new UnauthenticatedError(
      'authentication invalid (cookie not present)'
    )
  }

  try {
    const { userId, role, name, squareId, locations, active } = verifyJWT(token)
    req.user = { userId, role, name, squareId, locations, active }
    next()
  } catch (error) {
    throw new UnauthenticatedError('authentication invalid (cookie is invalid)')
  }
}

export const checkUserIsActive = (req, res, next) => {
  if (req.user.active === false) {
    throw new UnauthorizedError('deactivated users cannot access this route')
  }
  next()
}

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(
        'Administrative permissions required to access this route'
      )
    }
    next()
  }
}
