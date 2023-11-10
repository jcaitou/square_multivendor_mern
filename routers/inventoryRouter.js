import { Router } from 'express'
const router = Router()

import {
  getProductsInventory,
  updateProductsInventory,
  updateInventoryWarning,
} from '../controllers/inventoryController.js'

router.route('/').get(getProductsInventory)
router.route('/update').post(updateProductsInventory)
router.route('/update-warning').post(updateInventoryWarning)

export default router
