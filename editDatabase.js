import * as dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

import User from './models/UserModel.js'
import Location from './models/LocationModel.js'

try {
  console.log('connecting...')
  await mongoose.connect(process.env.MONGO_URL)
  console.log('connected')

  //set the default value of reporting period to all-time
  // await User.updateMany(
  //   {},
  //   { $set: { 'settings.defaultReportPeriod': 'all time' } }
  // )
  //await User.updateMany({}, { $push: { locations: 'LEDWQ3C33S4F4' } })

  //await Location.create({ name: 'Metrotown', _id: 'LT70Y6CNYBA67' })
  // const location = await Location.findOne({ _id: 'LEDWQ3C33S4F4' })
  // console.log(location.id)
  // const test = new mongoose.Types.ObjectId('LEDWQ3C33S4F4')
  // console.log(test)
  await User.updateMany({}, { $push: { locationsHistory: 'LEDWQ3C33S4F4' } })

  process.exit(0)
} catch (error) {
  console.log(error)
  process.exit(1)
}
