import { Router } from 'express'
const router = Router()
import {
  validateProductCreateInput,
  validateProductUpdateInput,
  validateProductIdParam,
} from '../middleware/validationMiddleware.js'

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
  .post(validateProductCreateInput, upsertProduct)
router.route('/batch-delete').post(batchDeleteProducts)
router
  .route('/:id')
  .get(getProduct)
  .patch(validateProductIdParam, validateProductUpdateInput, upsertProduct)
  .delete(validateProductIdParam, deleteProduct)

export default router
