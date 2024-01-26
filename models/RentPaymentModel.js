import mongoose from 'mongoose'
import { CONTRACT_TYPE, PAYMENT_STATUS } from '../utils/constants.js'
import day from 'dayjs'

const RentPaymentSchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Types.ObjectId,
      ref: 'Contract',
    },
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    amountDue: Number,
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
    paymentDate: Date,
    paymentRef: String,
  },
  { timestamps: true }
)

export default mongoose.model('RentPayment', RentPaymentSchema)
