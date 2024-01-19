import { Router } from 'express'
import {
  generateRandomTestOrders,
  generateSpecificTestOrder,
  copyOrder,
} from '../utils/generateTestOrders.js'

const router = Router()

router.route('/').post(generateSpecificTestOrder, copyOrder)
router.route('/random-generator').post(generateRandomTestOrders)

export default router
