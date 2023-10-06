import { multer } from 'multer'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, 'Import-' + Date.now())
  },
})

// Create the multer instance
export const upload = multer({ storage: storage })
