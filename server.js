import * as dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'
import express from 'express'
const app = express()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import cloudinary from 'cloudinary'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'

//routers
import productRouter from './routers/productRouter.js'
import inventoryRouter from './routers/inventoryRouter.js'
import discountRouter from './routers/discountRouter.js'
import orderRouter from './routers/orderRouter.js'
import authRouter from './routers/authRouter.js'
import userRouter from './routers/userRouter.js'
import uploadRouter from './routers/uploadRouter.js'
import exportRouter from './routers/exportRouter.js'
import webhookRouter from './routers/webhookRouter.js'
import locationRouter from './routers/locationRouter.js'

//public
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

//middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js'
import {
  authenticateUser,
  authorizePermissions,
} from './middleware/authMiddleware.js'

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

const __dirname = dirname(fileURLToPath(import.meta.url))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.static(path.resolve(__dirname, './client/dist')))
app.use(cookieParser())
app.use(express.json())
app.use(helmet())
app.use(mongoSanitize())

app.set('trust proxy', 3)

app.use('/api/v1/products', authenticateUser, productRouter)
app.use('/api/v1/inventory', authenticateUser, inventoryRouter)
app.use('/api/v1/discounts', authenticateUser, discountRouter)
app.use('/api/v1/orders', authenticateUser, orderRouter)
app.use('/api/v1/uploads', authenticateUser, uploadRouter)
app.use('/api/v1/exports', authenticateUser, exportRouter)
app.use('/api/v1/users', authenticateUser, userRouter)
app.use('/api/v1/locations', authenticateUser, locationRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/webhooks', webhookRouter)

//only for use while testing:
import testOrdersRouter from './routers/testOrdersRouter.js'
app.use('/api/v1/generate-orders', testOrdersRouter)
//delele above later

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'))
})

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'not found' })
})

app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5100

try {
  await mongoose.connect(process.env.MONGO_URL)
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`)
  })
} catch (error) {
  console.log(error)
  process.exit(1)
}
