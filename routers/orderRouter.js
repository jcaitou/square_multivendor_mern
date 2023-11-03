import { Router } from 'express'
import {
  getAllOrders,
  getSalesbyItem,
} from '../controllers/ordersController.js'

const router = Router()

router.get('/', getAllOrders)
router.get('/sales', getSalesbyItem)

export default router
