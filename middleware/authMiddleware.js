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
    const { userId, role, squareName, squareId } = verifyJWT(token)
    req.user = { userId, role, squareName, squareId }
    next()
  } catch (error) {
    throw new UnauthenticatedError('authentication invalid (cookie is invalid)')
  }
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
