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

router.get('/', getAllLocations)
router.post('/create-location', authorizePermissions('admin'), createLocation)
router.post(
  '/assign-vendor-location',
  authorizePermissions('admin'),
  assignLocation
)
router.post(
  '/remove-vendor-location',
  authorizePermissions('admin'),
  removeLocation
)

export default router
