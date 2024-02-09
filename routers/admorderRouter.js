import { Router } from 'express'
import {
  getAllOrdersAdm,
  getSalesbyItemAdm,
  getSalesByVendorAdm,
} from '../controllers/admordersController.js'
import { validateOrderQueryInput } from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', validateOrderQueryInput, getAllOrdersAdm)
router.get('/sales', validateOrderQueryInput, getSalesbyItemAdm)
router.get('/sales-by-vendor', validateOrderQueryInput, getSalesByVendorAdm)
// router.get('/stats', getStats)

export default router
