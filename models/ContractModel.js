import mongoose from 'mongoose'
import { CONTRACT_TYPE } from '../utils/constants.js'
import day from 'dayjs'

const ContractSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    location: String,
    contractType: {
      type: String,
      enum: Object.values(CONTRACT_TYPE),
      default: CONTRACT_TYPE.STARTER,
    },
    customSize: {
      type: Number,
      default: null,
    },
    monthlyRent: {
      type: Number,
      default: function () {
        if (this.contractType == CONTRACT_TYPE.ROTATING) {
          return 14000
        } else if (this.contractType == CONTRACT_TYPE.STARTER) {
          return 15000
        } else if (this.contractType == CONTRACT_TYPE.ESSENTIAL) {
          return 36000
        } else if (this.contractType == CONTRACT_TYPE.CUSTOM) {
          return 45000
        }
      },
    },
    startDate: {
      type: Date,
      default: day().format('YYYY-MM-DD'),
    },
    endDate: {
      type: Date,
      default: function () {
        var endDate = day(this.startDate)
        if (this.contractType == CONTRACT_TYPE.ROTATING) {
          endDate = endDate.add(1, 'month')
        } else {
          endDate = endDate.add(3, 'month')
        }
        if (endDate.get('month') == 11) {
          endDate = endDate
            .set(endDate.get('year') + 1)
            .set('month', 2)
            .set('date', 1)
        }
        return endDate
      },
    },
    renewable: {
      type: Boolean,
      default: function () {
        if (this.contractType == CONTRACT_TYPE.ROTATING) {
          return false
        } else {
          return true
        }
      },
    },
    willBeRenewed: {
      type: Boolean,
      default: true,
    },
    started: {
      //it only turns true once in its lifetime.
      type: Boolean,
      default: false,
    },
    ended: {
      //it only turns true once in its lifetime.
      //if both started & ended are true, then this contract can be archived.
      //if the same vendor wants to setup in the same store in the future, a new contract must be signed.
      type: Boolean,
      default: false,
    },
    contractId: {
      type: String,
      default: 'ABC12345',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Contract', ContractSchema)
