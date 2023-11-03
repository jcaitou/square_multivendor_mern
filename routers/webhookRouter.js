import { Router } from 'express'
import { createOrder, updateOrder } from '../controllers/webhookController.js'
//import agenda from '../jobs/agenda.js'

const router = Router()

router.post('/create-order', createOrder)
router.post('/update-order', updateOrder)

export default router