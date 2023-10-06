import { Router } from 'express'
const router = Router()

import { getProductsInventory } from '../controllers/inventoryController.js'

router.route('/').get(getProductsInventory)

export default router
