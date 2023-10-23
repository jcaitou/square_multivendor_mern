import mongoose from 'mongoose'
import { JOB_STATUS, JOB_TYPE } from '../utils/constants.js'
const DiscountSchema = new mongoose.Schema(
  {
    pricingRuleId: String,
    discountId: String,
    productSetId: String,
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Discount', DiscountSchema)
