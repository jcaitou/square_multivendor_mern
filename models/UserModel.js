import mongoose from 'mongoose'

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
    locations: [
      {
        type: String,
      },
    ],
    settings: {
      receiveInventoryWarningEmails: Boolean,
      defaultInventoryWarningLevel: Number,
      defaultDiscountOptIn: Boolean,
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
