import mongoose from 'mongoose'
import day from 'dayjs'

const PayoutSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Types.ObjectId,
      ref: 'Contract',
    },
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    amountToPay: Number,
    forPeriodStart: {
      type: Date,
      default: day().format('YYYY-MM-DD'),
    },
    forPeriodEnd: {
      type: Date,
      default: function () {
        var endDate = day(this.startDate).add(1, 'month').subtract(1, 'day')
        return endDate
      },
    },
    paid: {
      type: Boolean,
      default: false,
    },
    payoutDate: Date,
    payoutRef: String,
  },
  { timestamps: true }
)

export default mongoose.model('Payout', PayoutSchema)
