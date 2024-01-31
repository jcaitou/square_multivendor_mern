import { Router } from 'express'
import {
  getAllOrders,
  getAllOrdersAdm,
  getSalesbyItem,
  getStats,
} from '../controllers/ordersController.js'
import { validateOrderQueryInput } from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', validateOrderQueryInput, getAllOrders)
router.get(
  '/adm-all-orders',
  authorizePermissions('admin'),
  validateOrderQueryInput,
  getAllOrdersAdm
)
router.get('/sales', validateOrderQueryInput, getSalesbyItem)
router.get('/stats', getStats)

export default router
