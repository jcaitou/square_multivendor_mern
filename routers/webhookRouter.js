import { Router } from 'express'
import {
  createOrder,
  updateOrder,
  inventoryUpdate,
} from '../controllers/webhookController.js'
//import agenda from '../jobs/agenda.js'

const router = Router()

router.post('/create-order', createOrder)
router.post('/update-order', updateOrder)
router.post('/inventory-update', inventoryUpdate)

export default router
