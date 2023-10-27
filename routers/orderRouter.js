import { Router } from 'express'
import { getAllOrders } from '../controllers/ordersController.js'
//import agenda from '../jobs/agenda.js'

const router = Router()

router.get('/', getAllOrders)

export default router
