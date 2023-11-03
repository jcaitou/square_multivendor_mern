import { Router } from 'express'
import {
  exportAllProducts,
  exportAllInventory,
} from '../controllers/exportController.js'

const router = Router()

router.route('/export-all-products').get(exportAllProducts)
router.route('/export-all-inventory').get(exportAllInventory)

export default router
