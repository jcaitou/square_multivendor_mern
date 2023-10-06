import { Router } from 'express'
import multer from 'multer'

import {
  batchUpdateProductUploadFile,
  startFileAction,
} from '../controllers/uploadController.js'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, 'Import-' + Date.now() + '.csv')
  },
})

// Create the multer instance
const upload = multer({ storage: storage })

const router = Router()

router
  .route('/product-batch-update')
  .post(upload.single('product-update'), batchUpdateProductUploadFile)
router.route('/start/:id').post(startFileAction)
export default router
