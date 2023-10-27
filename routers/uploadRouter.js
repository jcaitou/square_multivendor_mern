import { Router } from 'express'
import {
  getAllFileActions,
  batchUpdateUploadFile,
  startFileAction,
} from '../controllers/uploadController.js'
import upload from '../middleware/multerMiddleware.js'

const router = Router()

router
  .route('/')
  .get(getAllFileActions)
  .post(upload.single('update-file'), batchUpdateUploadFile)
router.route('/start/:id').post(startFileAction)
export default router
