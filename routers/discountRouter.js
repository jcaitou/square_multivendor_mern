import { Router } from 'express'
const router = Router()
import { checkUserIsActive } from '../middleware/authMiddleware.js'
import {
  getAllDiscounts,
  getStorewideDiscounts,
  storewideOptInOut,
  upsertDiscount,
  getDiscount,
  deleteDiscount,
  getDiscountCategories,
} from '../controllers/discountController.js'

router.route('/').get(getAllDiscounts).post(checkUserIsActive, upsertDiscount)
router.route('/storewide').get(getStorewideDiscounts).post(storewideOptInOut)
router.route('/discount-categories').get(getDiscountCategories)

router
  .route('/:id')
  .get(getDiscount)
  .patch(checkUserIsActive, upsertDiscount)
  .delete(deleteDiscount)

export default router
