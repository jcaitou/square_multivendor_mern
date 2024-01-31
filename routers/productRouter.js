import { Router } from 'express'
const router = Router()
import {
  validateProductInput,
  validateProductIdParam,
} from '../middleware/validationMiddleware.js'
import { checkUserIsActive } from '../middleware/authMiddleware.js'
import {
  getAllProducts,
  upsertProduct,
  getProduct,
  deleteProduct,
  batchDeleteProducts,
} from '../controllers/productController.js'

router
  .route('/')
  .get(getAllProducts)
  .post(validateProductInput, checkUserIsActive, upsertProduct)
router.route('/batch-delete').post(batchDeleteProducts)
router
  .route('/:id')
  .get(getProduct)
  .patch(
    validateProductIdParam,
    validateProductInput,
    checkUserIsActive,
    upsertProduct
  )
  .delete(validateProductIdParam, deleteProduct)

export default router
