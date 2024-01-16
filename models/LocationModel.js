import mongoose from 'mongoose'
const LocationSchema = new mongoose.Schema(
  {
    name: String,
    _id: String,
  },
  { timestamps: true }
)

export default mongoose.model('Location', LocationSchema)
