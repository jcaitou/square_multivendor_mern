import cron from 'node-cron'
import mongoose from 'mongoose'
import { copyOrders } from './tasks/copyOrders.js'
import { generatePayables } from './tasks/generatePayables.js'
import { generateReceivables } from './tasks/generateReceivables.js'
import { generateRandomTestOrdersInner } from './utils/generateTestOrders.js'

try {
  await mongoose.connect(process.env.MONGO_URL)
  console.log('Mongoose connected, cron is running...')
} catch (error) {
  console.log(error)
  process.exit(1)
}

// //run once:
// await copyOrders()
// await generateRandomTestOrdersInner()
// await generateReceivables()
// await generatePayables()
// process.exit(0)

//this is needed in the future:
cron.schedule('*/20 7-23 * * *', () => {
  copyOrders()
})
cron.schedule('0 1 * * *', () => {
  generateReceivables()
})
cron.schedule('0 2 * * *', () => {
  generatePayables()
})

//this is NOT needed in the future:
cron.schedule('18,27,42,59 10-20 * * *', () => {
  generateRandomTestOrdersInner()
})
