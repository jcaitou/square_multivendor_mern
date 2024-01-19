import cron from 'node-cron'
import mongoose from 'mongoose'
import { copyOrders } from './tasks/copyOrders.js'
import { generateRandomTestOrdersInner } from './utils/generateTestOrders.js'

try {
  await mongoose.connect(process.env.MONGO_URL)
  console.log('Mongoose connected, cron is running...')
} catch (error) {
  console.log(error)
  process.exit(1)
}

// //run once:
// copyOrders()
// generateRandomTestOrdersInner()

//this is needed in the future:
cron.schedule('*/20 7-23 * * *', () => {
  copyOrders()
})

//this is NOT needed in the future:
//generate one random order per day at 5PM
cron.schedule('0 17 * * *', () => {
  generateRandomTestOrdersInner()
})
