import { Router } from 'express'
const router = Router()
import {
  validateProductCreateInput,
  validateProductUpdateInput,
  validateProductIdParam,
} from '../middleware/validationMiddleware.js'

import {
  getAllDiscounts,
  upsertDiscount,
  getDiscount,
} from '../controllers/discountController.js'

router.route('/').get(getAllDiscounts).post(upsertDiscount)

router.route('/:id').get(getDiscount).patch(upsertDiscount)

export default router
