import { Router } from 'express'
const router = Router()
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

router.post('/register', authenticateUser, [
  authorizePermissions('admin'),
  validateRegisterInput,
  register,
])

export default router
