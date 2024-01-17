import { Router } from 'express'
import {
  generateTestOrders,
  generateSpecificTestOrder,
  copyOrders,
} from '../utils/generateTestOrders.js'

const router = Router()

router.route('/').post(generateSpecificTestOrder)
router.route('/copy-orders').post(copyOrders)

export default router
