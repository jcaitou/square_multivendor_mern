import { Router } from 'express'
const router = Router()

import {
  getAllProducts,
  createProduct,
  getProduct,
  deleteProduct,
} from '../controllers/productController.js'

router.route('/').get(getAllProducts).post(createProduct)
router.route('/:id').get(getProduct).delete(deleteProduct)

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
