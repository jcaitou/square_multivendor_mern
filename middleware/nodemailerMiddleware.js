import nodemailer from 'nodemailer'

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
    pass: '48351202ffca80adfaf523fdb54829ed',
  },
})
