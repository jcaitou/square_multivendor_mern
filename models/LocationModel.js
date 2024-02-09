import mongoose from 'mongoose'
const LocationSchema = new mongoose.Schema(
  {
    name: String,
    _id: String,
    fees: {
      rotating: Number,
      starter: Number,
      essential: Number,
      custom: Number,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Location', LocationSchema)
