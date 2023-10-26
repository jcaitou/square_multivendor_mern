import * as dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'
import express from 'express'
const app = express()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'

//routers
import jobRouter from './routers/jobRouter.js'
import productRouter from './routers/productRouter.js'
import inventoryRouter from './routers/inventoryRouter.js'
import discountRouter from './routers/discountRouter.js'
import authRouter from './routers/authRouter.js'
import userRouter from './routers/userRouter.js'
import uploadRouter from './routers/uploadRouter.js'
import webhookRouter from './routers/webhookRouter.js'

//middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js'
import { authenticateUser } from './middleware/authMiddleware.js'

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(cookieParser())
app.use(express.json())

app.use('/api/v1/products', authenticateUser, productRouter)
app.use('/api/v1/inventory', authenticateUser, inventoryRouter)
app.use('/api/v1/discounts', authenticateUser, discountRouter)
app.use('/api/v1/upload', authenticateUser, uploadRouter)
//app.use('/api/v1/jobs', authenticateUser, jobRouter)
app.use('/api/v1/users', authenticateUser, userRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/webhooks', webhookRouter)

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
