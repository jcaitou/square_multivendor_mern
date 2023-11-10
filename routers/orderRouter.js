import { Router } from 'express'
import {
  getAllOrders,
  getSalesbyItem,
  getStats,
} from '../controllers/ordersController.js'
import { validateOrderQueryInput } from '../middleware/validationMiddleware.js'

const router = Router()

router.get('/', validateOrderQueryInput, getAllOrders)
router.get('/sales', validateOrderQueryInput, getSalesbyItem)
router.get('/stats', getStats)

export default router
