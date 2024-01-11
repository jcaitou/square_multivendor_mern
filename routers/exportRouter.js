import { Router } from 'express'
import {
  exportAllProducts,
  exportAllInventory,
  exportOrders,
  exportBarcodes,
} from '../controllers/exportController.js'

const router = Router()

router.route('/export-all-products').get(exportAllProducts)
router.route('/export-all-inventory').get(exportAllInventory)
router.route('/export-orders').post(exportOrders)
router.route('/export-barcodes').get(exportBarcodes)

export default router
