import mongoose from 'mongoose'
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
    locations: [
      {
        type: String,
      },
    ],
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
