import mongoose from 'mongoose'
import { FILE_TYPE, FILE_UPLOAD_STATUS } from '../utils/constants.js'
const FileActionSchema = new mongoose.Schema(
  {
    fileType: {
      type: String,
      enum: Object.values(FILE_TYPE),
      default: FILE_TYPE.PRODUCT_UPDATE,
    },
    fileName: String,
    fileUrl: String,
    filePublicId: String,
    status: {
      type: String,
      enum: Object.values(FILE_UPLOAD_STATUS),
      default: FILE_UPLOAD_STATUS.IDLE,
    },
    resultsFileUrl: String,
    resultsFilePublicId: String,
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export default mongoose.model('FileAction', FileActionSchema)
