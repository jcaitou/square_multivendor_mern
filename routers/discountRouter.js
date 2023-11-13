import { Router } from 'express'
const router = Router()
import {
  getAllDiscounts,
  getStorewideDiscounts,
  storewideOptInOut,
  upsertDiscount,
  getDiscount,
  deleteDiscount,
  getDiscountCategories,
} from '../controllers/discountController.js'

router.route('/').get(getAllDiscounts).post(upsertDiscount)
router.route('/storewide').get(getStorewideDiscounts).post(storewideOptInOut)
router.route('/discount-categories').get(getDiscountCategories)

router
  .route('/:id')
  .get(getDiscount)
  .patch(upsertDiscount)
  .delete(deleteDiscount)

export default router
