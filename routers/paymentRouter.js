import { Router } from 'express'
const router = Router()
import {
  getAllPaymentsVendor,
  getAllPaymentsAdmin,
  getPayment,
  editPayment,
} from '../controllers/paymentController.js'
import {
  validateRegisterInput,
  validateLoginInput,
  validatePasswordInput,
  validatePasswordUpdateInput,
  validatePaymentIdParam,
} from '../middleware/validationMiddleware.js'
import {
  authorizePermissions,
  authenticateUser,
} from '../middleware/authMiddleware.js'

router.route('/').get(getAllPaymentsVendor)
router.route('/adm/').get([authorizePermissions('admin'), getAllPaymentsAdmin])
// .post([authorizePermissions('admin'), createContract])
// router.post('/register', authenticateUser, [
//   authorizePermissions('admin'),
//   validateRegisterInput,
//   register,
// ])
router.route('/adm/:id').post([authorizePermissions('admin'), editPayment]) //edit payment (including mark paid)
router.route('/:id').get(validatePaymentIdParam, getPayment)

export default router
