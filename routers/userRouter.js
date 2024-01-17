import { Router } from 'express'
const router = Router()

import { validateUpdateUserInput } from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

import {
  getCurrentUser,
  getApplicationStats,
  updateUser,
  activateDeactivateUser,
  updateUserSettings,
  updateUserLocations,
} from '../controllers/userController.js'

router.get('/current-user', getCurrentUser)
// router.get('/admin/app-stats', [
//   authorizePermissions('admin'),
//   getApplicationStats,
// ])
// router.patch('/update-user', validateUpdateUserInput, updateUser)
router.patch('/activation', [
  authorizePermissions('admin'),
  activateDeactivateUser,
])
router.patch('/update-user-settings', updateUserSettings)
router.patch('/update-user-locations', [
  authorizePermissions('admin'),
  updateUserLocations,
])

export default router
