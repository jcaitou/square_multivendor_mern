import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'
dotenv.config()
const { NODEMAILER_PASSWORD } = process.env

// export const transporter = nodemailer.createTransport({
//   host: 'sandbox.smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: 'd942e4938bca34',
//     pass: 'f121a3bfe2f0b7',
//   },
// })

export const transporter = nodemailer.createTransport({
  host: 'live.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'api',
    pass: NODEMAILER_PASSWORD,
  },
})
