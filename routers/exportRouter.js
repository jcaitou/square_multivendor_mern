import { Router } from 'express'
import {
  exportAllProducts,
  exportAllInventory,
  exportOrders,
} from '../controllers/exportController.js'

const router = Router()

router.route('/export-all-products').get(exportAllProducts)
router.route('/export-all-inventory').get(exportAllInventory)
router.route('/export-orders').get(exportOrders)

export default router
