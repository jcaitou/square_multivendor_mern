import { Router } from 'express'
import { generateTestOrders, copyOrders } from '../utils/generateTestOrders.js'

const router = Router()

router.route('/').post(generateTestOrders)
router.route('/copy-orders').post(copyOrders)

export default router
