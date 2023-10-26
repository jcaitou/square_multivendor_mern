import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: {
    type: String,
    default: '0000000000',
  },
  password: String,
  squareName: String,
  orderDate: Date,
  soldBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
})

UserSchema.methods.toJSON = function () {
  var obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('Order', OrderSchema)
