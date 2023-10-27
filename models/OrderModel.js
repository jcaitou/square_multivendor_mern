import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
  {
    orderId: String,
    location: String,
    orderDate: Date,
    orderItems: [
      {
        itemName: String,
        itemVariationId: String,
        quantity: Number,
        basePrice: Number,
        totalDiscount: Number,
        totalMoney: Number,
        itemVendor: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  { timestamps: true }
)

export default mongoose.model('Order', OrderSchema)
