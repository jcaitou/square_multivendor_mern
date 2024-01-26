import { Router } from 'express'
const router = Router()
import {
  register,
  login,
  logout,
  registerSpecific,
  changePassword,
} from '../controllers/authController.js'
import { createContract } from '../controllers/contractController.js'
import {
  validateRegisterInput,
  validateLoginInput,
  validatePasswordInput,
  validatePasswordUpdateInput,
} from '../middleware/validationMiddleware.js'
import {
  authorizePermissions,
  authenticateUser,
} from '../middleware/authMiddleware.js'
import rateLimiter from 'express-rate-limit'

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { msg: 'IP rate limit exceeded, retry in 15 minutes.' },
})

router.post(
  '/register',
  // authenticateUser,
  [
    // authorizePermissions('admin'),
    validateRegisterInput,
    register,
  ]
)
router.post('/register-specific', registerSpecific) //only for adding specific user info during testing phase
router.post(
  '/update-password',
  authenticateUser,
  validatePasswordUpdateInput,
  changePassword
)
router.post('/login', apiLimiter, validateLoginInput, login)
router.get('/logout', logout)

export default router
