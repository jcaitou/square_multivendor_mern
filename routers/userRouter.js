import { Router } from 'express'
const router = Router()

import { validateUpdateUserInput } from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

import {
  getCurrentUser,
  getAllUsers,
  updateUser,
  activateDeactivateUser,
  updateUserSettings,
  updateUserLocations,
} from '../controllers/userController.js'

router.get('/current-user', getCurrentUser)
router.get('/all-users', [authorizePermissions('admin'), getAllUsers])
// router.patch('/update-user', validateUpdateUserInput, updateUser)

router.patch('/update-user-settings', updateUserSettings)

router.patch('/adm/activation', [
  authorizePermissions('admin'),
  activateDeactivateUser,
])

//THIS FUNCTION (updateUserLocations) IS NOT USED, BUT KEEP IT FOR NOW, IN CASE THE INVENTORY INITIALIZATION SCREWS UP IN THE FUTURE:
router.patch('/adm/update-user-locations', [
  authorizePermissions('admin'),
  updateUserLocations,
])

export default router
