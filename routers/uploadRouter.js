import { Router } from 'express'
import multer from 'multer'

import {
  batchUpdateUploadFile,
  startFileAction,
} from '../controllers/uploadController.js'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, 'Import-' + req.body.type + '-' + Date.now() + '.csv')
  },
})

// Create the multer instance
const upload = multer({ storage: storage })

const router = Router()

router.route('/').post(upload.single('update-file'), batchUpdateUploadFile)
router.route('/start/:id').post(startFileAction)
export default router
