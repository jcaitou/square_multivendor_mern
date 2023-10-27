import { StatusCodes } from 'http-status-codes'
import { nanoid } from 'nanoid'
import { squareClient } from '../utils/squareUtils.js'
import JSONBig from 'json-bigint'
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  SquareApiError,
} from '../errors/customError.js'
import Order from '../models/OrderModel.js'
import mongoose from 'mongoose'

export const getAllOrders = async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.user.userId)
  const orders = await Order.find(
    {
      'orderItems.itemVendor': id,
    },
    {
      orderId: 1,
      location: 1,
      orderDate: 1,
      orderItems: {
        $elemMatch: {
          itemVendor: id,
        },
      },
    }
  )

  //set up pagination

  return res.status(StatusCodes.OK).json({ orders })
}
