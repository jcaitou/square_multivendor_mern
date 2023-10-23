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
  deleteDiscount,
} from '../controllers/discountController.js'

router.route('/').get(getAllDiscounts).post(upsertDiscount)

router
  .route('/:id')
  .get(getDiscount)
  .patch(upsertDiscount)
  .delete(deleteDiscount)

export default router
