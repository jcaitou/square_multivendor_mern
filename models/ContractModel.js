import mongoose from 'mongoose'
const ContractSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: mongoose.Types.ObjectId,
      ref: 'Location',
    },
    contractType: {
      type: String,
      enum: Object.values(CONTRACT_TYPE),
      default: CONTRACT_TYPE.STARTER,
    },
    customSize: Number,
    monthlyRent: Number,
    startDate: Date,
    endDate: Date,
    renewable: Boolean,
    contractId: String,
  },
  { timestamps: true }
)

export default mongoose.model('Contract', ContractSchema)
