import { Router } from 'express'
const router = Router()
//import { validateJobInput, validateIdParam } from '../middleware/validationMiddleware.js';

import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js'

// router.get('/', getAllJobs);
// router.post('/', createJob);

// router.route('/').get(getAllJobs).post(validateJobInput, createJob);
// router.route('/:id').get(validateIdParam, getJob).patch(validateIdParam, validateJobInput, updateJob).delete(validateIdParam, deleteJob);

export default router
