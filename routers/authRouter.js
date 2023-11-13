import { Router } from 'express'
import {
  register,
  login,
  logout,
  registerSpecific,
  changePassword,
} from '../controllers/authController.js'
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

const router = Router()

router.post('/register', authenticateUser, [
  authorizePermissions('admin'),
  validateRegisterInput,
  register,
])
router.post('/register-specific', registerSpecific) //only for adding specific user info during testing phase
router.post(
  '/update-password',
  authenticateUser,
  validatePasswordUpdateInput,
  changePassword
)
router.post('/login', validateLoginInput, login)
router.get('/logout', logout)

export default router
