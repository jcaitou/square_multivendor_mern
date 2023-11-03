import { Router } from 'express'
import { generateTestOrders } from '../utils/generateTestOrders.js'

const router = Router()

router.route('/').post(generateTestOrders)

export default router
