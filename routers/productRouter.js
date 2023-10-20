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
  updateProduct,
  deleteProduct,
  batchDeleteProducts,
  batchUpdateProducts,
} from '../controllers/productController.js'

router
  .route('/')
  .get(getAllProducts)
  .post(validateProductCreateInput, upsertProduct)
router.route('/batch-delete').post(batchDeleteProducts)
//router.route('/batch-update').post(batchUpdateProducts)
router
  .route('/:id')
  .get(getProduct)
  .patch(validateProductIdParam, validateProductUpdateInput, upsertProduct)
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
