import mongoose from 'mongoose'
import { DEFAULT_REPORT_PERIOD } from '../utils/constants.js'
// import Inc from 'mongoose-sequence'
// const AutoIncrement = Inc(mongoose)

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: {
      type: String,
      default: '0000000000',
    },
    password: String,
    squareId: String,
    skuId: {
      type: Number,
      unique: true,
    },
    locations: [String],
    locationsHistory: [String],
    settings: {
      receiveInventoryWarningEmails: {
        type: Boolean,
        default: true,
      },
      defaultInventoryWarningLevel: {
        type: Number,
        default: 5,
      },
      defaultDiscountOptIn: {
        type: Boolean,
        default: false,
      },
      defaultReportPeriod: {
        type: String,
        enum: Object.values(DEFAULT_REPORT_PERIOD),
        default: DEFAULT_REPORT_PERIOD.ALL_TIME,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
)

UserSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', UserSchema)
