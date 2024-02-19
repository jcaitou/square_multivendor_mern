import { Router } from 'express'
const router = Router()
import {
  getAllPaymentsVendor,
  getAllPaymentsAdmin,
  getPayment,
  editPayment,
} from '../controllers/paymentController.js'
import { validateIdParam } from '../middleware/validationMiddleware.js'
import { authorizePermissions } from '../middleware/authMiddleware.js'

router.route('/').get(getAllPaymentsVendor)
router.route('/adm/').get([authorizePermissions('admin'), getAllPaymentsAdmin])
router
  .route('/adm/:id')
  .post(
    validateIdParam('RentPayment'),
    authorizePermissions('admin'),
    editPayment
  )
router.route('/:id').get(validateIdParam('RentPayment'), getPayment)

export default router
