import { Router } from 'express'
const router = Router()
import {
  validateProductCreateInput,
  validateProductUpdateInput,
  validateProductIdParam,
} from '../middleware/validationMiddleware.js'

import {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  batchDeleteProducts,
  batchUpdateProducts,
} from '../controllers/productController.js'

router
  .route('/')
  .get(getAllProducts)
  .post(validateProductCreateInput, createProduct)
router.route('/batch-delete').post(batchDeleteProducts)
router.route('/batch-update').post(batchUpdateProducts)
router
  .route('/:id')
  .get(getProduct)
  .patch(validateProductIdParam, validateProductUpdateInput, updateProduct)
  .delete(validateProductIdParam, deleteProduct)

// router.get('/', getAllJobs);
// router.post('/', createJob);
/*
router.route('/').get(getAllJobs).post(validateJobInput, createJob)
router
  .route('/:id')
  .get(validateIdParam, getJob)
  .patch(validateIdParam, validateJobInput, updateJob)
  .delete(validateIdParam, deleteJob)
*/
export default router
