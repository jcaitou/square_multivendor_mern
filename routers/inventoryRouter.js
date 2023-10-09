import { Router } from 'express'
const router = Router()

import {
  getProductsInventory,
  updateProductsInventory,
} from '../controllers/inventoryController.js'

router.route('/').get(getProductsInventory)
router.route('/update').post(updateProductsInventory)

export default router
