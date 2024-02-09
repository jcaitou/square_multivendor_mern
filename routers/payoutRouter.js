import { Router } from 'express'
const router = Router()
import {
  getAllPayoutsVendor,
  getAllPayoutsAdmin,
  editPayout,
  getPayout,
} from '../controllers/payoutController.js'
import {
  validatePaymentInput,
  validateIdParam,
} from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

router.route('/').get(getAllPayoutsVendor)
router.route('/adm/').get([authorizePermissions('admin'), getAllPayoutsAdmin])
router
  .route('/adm/:id')
  .post(validatePaymentInput, validateIdParam('Payout'), [
    (authorizePermissions('admin'), editPayout),
  ]) //edit payout (including mark paid)
router.route('/:id').get(validateIdParam('Payout'), getPayout)

export default router
