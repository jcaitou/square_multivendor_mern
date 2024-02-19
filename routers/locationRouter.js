import { Router } from 'express'
const router = Router()
import {
  getAllLocations,
  createLocation,
  assignLocation,
  removeLocation,
} from '../controllers/locationController.js'
import {
  authorizePermissions,
  authenticateUser,
} from '../middleware/authMiddleware.js'

router.get('/', getAllLocations) //this is public because register requires this route (for open beta)
router.post(
  '/create-location',
  authenticateUser,
  authorizePermissions('admin'),
  createLocation
)
router.post(
  '/assign-vendor-location',
  authenticateUser,
  authorizePermissions('admin'),
  assignLocation
)
router.post(
  '/remove-vendor-location',
  authenticateUser,
  authorizePermissions('admin'),
  removeLocation
)

export default router
